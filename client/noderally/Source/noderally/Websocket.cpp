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
      UE_LOG(WebsocketLog, Log, TEXT("Established connection"));
      break;
    case LWS_CALLBACK_CLOSED:
      break;
    case LWS_CALLBACK_CLIENT_CONNECTION_ERROR:
      UE_LOG(WebsocketLog, Log, TEXT("Connection Fail"));
      break;
    case LWS_CALLBACK_RECEIVE:
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

