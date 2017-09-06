// Fill out your copyright notice in the Description page of Project Settings.


#include "NoderallyGameMode.h"
#include "noderally.h"

using namespace std;


void 
ANoderallyGameMode::ConnectWebsocket()
{
  
  FString hostAndPort = host + ":"+ FString::FromInt(serverPort);
  std::string url(TCHAR_TO_UTF8(*hostAndPort));
   
  try 
  {
    
    _wsRunnable = new WebsocketRunnable(url);
    _wsRunnable->StartThread();
    
   
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

