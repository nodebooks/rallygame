// Fill out your copyright notice in the Description page of Project Settings.


#include "NoderallyGameMode.h"
#include "noderally.h"

using namespace std;

void
ANoderallyGameMode::SendWithWebsocket( TSharedRef<FJsonObject> & json ) const
{
  FString output;
  // create writer for json
  TSharedRef<TJsonWriter<TCHAR>> writer = TJsonWriterFactory<>::Create(&output);
  // serialize json object
  FJsonSerializer::Serialize(json, writer);  
  
  std::string strOut( TCHAR_TO_UTF8(*output) );
  
  if ( _wsRunnable == nullptr ) 
  {
    UE_LOG(WebsocketLog, Error, TEXT("Attempted to write websocket without connecting!"));
  }
  else 
  {
    _wsRunnable->_websocket->Send(strOut);
  }
}

void 
ANoderallyGameMode::ConnectWebsocket()
{
  
  FString hostAndPort = host + ":"+ FString::FromInt(serverPort);
  std::string url(TCHAR_TO_UTF8(*hostAndPort));
   
  try 
  {
    
    _wsRunnable = new WebsocketRunnable(url);
    _wsRunnable->StartThread();
    // Set receiver
    _wsRunnable->_websocket->SetReceiver(this);
	
    UE_LOG(WebsocketLog, Warning, TEXT("good to go!"));
  } 
  catch (runtime_error & err )
  {
      UE_LOG(WebsocketLog, Error, TEXT("Websocket connection error %s "), *FString(err.what()));
      
  }
}

void
ANoderallyGameMode::DisconnectWebsocket()
{
  _wsRunnable->RequestExit();
  delete _wsRunnable;
  _wsRunnable = nullptr;
}

void 
ANoderallyGameMode::OnReceive(const std::string& msg)
{

  TSharedPtr<FJsonObject> jsonObject(new FJsonObject);
  TSharedRef<TJsonReader<>> reader = TJsonReaderFactory<>::Create(msg.c_str());
  FJsonSerializer::Deserialize(reader, jsonObject);
  FString message = jsonObject->GetStringField(TEXT("message"));
  
  
  if ( message == "login" )
  {
    
    FString tmp;
    TSharedPtr<FPlayerAuth> auth(new FPlayerAuth);
    bool result = jsonObject->GetBoolField(TEXT("response"));
    (*auth).username = TCHAR_TO_UTF8(*jsonObject->GetStringField(TEXT("username")));
    if ( result )
    {
      AsyncTask(ENamedThreads::GameThread, [this,&auth]() {
        this->OnPlayerAuthenticationSuccess(*auth);      
      });
    }
    else
    {
      if ( jsonObject->TryGetStringField(TEXT("reason"), tmp) )
      {
        auth->reason = tmp;
      }
      AsyncTask(ENamedThreads::GameThread, [this,&auth]() {
        this->OnPlayerAuthenticationFail(*auth);      
      });  
    }
  }  
  else
  {
    UE_LOG(WebsocketLog, Warning, TEXT("Unhandled websocket message:%s"), *FString(msg.c_str()));
  }
}  
    
void ANoderallyGameMode::Authenticate( const FPlayerAuth& playerAuth)
{
  TSharedRef<FJsonObject> json = MakeShareable(new FJsonObject());
  
  json->SetStringField("message", "login");
  json->SetStringField("username", playerAuth.username);
  json->SetStringField("password", playerAuth.password);
    
  SendWithWebsocket(json);
  
}

void ANoderallyGameMode::OnPlayerAuthenticationSuccess_Implementation(const FPlayerAuth& auth)
{
}

void ANoderallyGameMode::OnPlayerAuthenticationFail_Implementation(const FPlayerAuth& auth)
{
}
