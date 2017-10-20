// Fill out your copyright notice in the Description page of Project Settings.


#include "Websocket.h"
#include "noderally.h"
#include <sstream>
#include <utf8.h>

using namespace std;

namespace
{
  int callback_http( 
		     lws *ws,
		     lws_callback_reasons reason,
		     void *user,
		     void *in,
		     size_t len )
  {
    Websocket * socket = reinterpret_cast<Websocket *>(user);
    switch( reason )
    {
    case LWS_CALLBACK_CLIENT_ESTABLISHED:
      {
        IReceiver * receiver = socket->GetReceiver();
      
        receiver->OnReceive("{ \"message\": \"connection_established\" }");
        
        UE_LOG(WebsocketLog, Log, TEXT("Established connection"));
      }
      break;
    case LWS_CALLBACK_CLOSED:
      break;
    case LWS_CALLBACK_CLIENT_CONNECTION_ERROR:
      {
        IReceiver * receiver = socket->GetReceiver();
        receiver->OnReceive("{ \"message\": \"connection_fail\" }");
        UE_LOG(WebsocketLog, Log, TEXT("Connection Fail"));
      }
      break;
    case LWS_CALLBACK_RECEIVE:
      break;
    case LWS_CALLBACK_CLIENT_RECEIVE:
      {
          
        IReceiver * receiver = socket->GetReceiver();
        size_t remaining = lws_remaining_packet_payload(ws);

        if ( receiver )
        {
          socket->_received.push_back(string((char *)in));
          // When receiving data from server
          if ( remaining == 0 ) 
          {    
            bool isFinal = lws_is_final_fragment(ws);
            if ( isFinal )
            {
              socket->ResetReceive();
              receiver->OnReceive(socket->_receiveCombined);
              socket->_receiveCombined.clear();
            }
          }
        }        
      }
    break;
      case LWS_CALLBACK_CLIENT_WRITEABLE:
      {
        // Access data in Websocket (make a copy)
        socket->_data_mutex.lock();
        string tmp = socket->_data;
        socket->_data_mutex.unlock();  
        string msg;
        // convert into UTF-8
        utf8::replace_invalid(tmp.begin(), tmp.end(), back_inserter(msg));
        // construct send buffer
        char * buf = new char[LWS_SEND_BUFFER_PRE_PADDING +
                              msg.length() + 
                              LWS_SEND_BUFFER_POST_PADDING ]; 

        // copy data to be sent into send buffer
        strncpy(&buf[LWS_SEND_BUFFER_PRE_PADDING], msg.c_str(), msg.length());
        // Write into websocket
        int n = lws_write(ws,
                 (unsigned char *)&buf[LWS_SEND_BUFFER_PRE_PADDING],
                 msg.length(), LWS_WRITE_TEXT); 
        // Check if there were problems
        if ( n < 0 )					throw runtime_error("Not able to write");
        else if ( n <  msg.length() )   throw runtime_error("Partial write");
         

        delete [] buf;
      }
      break;
    default:
      break;
    }
    return 0;
  }
}

lws_protocols Websocket::protocols[] = {
  {
    "http-only",   // name
    callback_http, // callback
    0              // per_session_data_size
  },
  { NULL, NULL, 0, 0 } /* end */
};

Websocket::Websocket()
{
  _context = NULL;
  _ws = NULL;
  memset(&_info, 0, sizeof _info);
    
  _info.port = CONTEXT_PORT_NO_LISTEN;
  _info.protocols = protocols;
  _info.extensions = NULL;
  _info.gid = -1;
  _info.uid = -1;

  _context = lws_create_context(&_info);
}


Websocket::~Websocket()
{
  if ( _context )
  {
    lws_context_destroy(_context);
    _context = nullptr;
  }
}
  
void
Websocket::Connect(const std::string & url)
{
  if ( _context == NULL)
  {
    throw runtime_error("Creating libwebsocket context failed");
  }
  
  std::string address = url;
  int port = Websocket::DEFAULT_PORT;
  size_t pos = url.find_first_of(':');
  if ( pos != string::npos )
  {
    address = url.substr(0,pos);
    stringstream ss ;
    ss << url.substr(pos+1);
    if ( ! (ss >> port) )
    {
      throw runtime_error("Invalid port");
    }
  }
  
  lws_client_connect_info cci;
  cci.context = _context;
  cci.address = address.c_str();
  cci.port = port;
  cci.ssl_connection = 0;
  cci.path = "/";
  cci.host = "localhost";
  cci.origin = "socket-name";
  cci.protocol = NULL,
  cci.ietf_version_or_minus_one = -1;
  cci.userdata = this;
  cci.client_exts  = 0;

  _ws = lws_client_connect_via_info(&cci);
    
  if ( _ws == NULL) {
    throw runtime_error("libwebsocket connect failed");
  }
}



void
Websocket::Process(int polldelay)
{
	lws_service(_context, polldelay);
}

void
Websocket::SetReceiver(IReceiver *receiver)
{
  _receiver = receiver;
}

IReceiver *
Websocket::GetReceiver()
{
  return _receiver;
}

void 
Websocket::ResetReceive()
{
  _data_mutex.lock();
  _receiveCombined.clear();
  for( auto & s: _received )
    _receiveCombined += s; 
  _received.clear();
  _data_mutex.unlock();
}

void
Websocket::Send( const std::string & msg )
{
  _data_mutex.lock();
  _data = msg;
  _data_mutex.unlock();
  
  lws_callback_on_writable(_ws);
}
