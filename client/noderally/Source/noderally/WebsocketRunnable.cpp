// Fill out your copyright notice in the Description page of Project Settings.


#include "WebsocketRunnable.h"
#include "noderally.h"

WebsocketRunnable::WebsocketRunnable( const std::string & url )
{
  _connectionUrl = url;
  _websocket = new Websocket();
}

WebsocketRunnable::~WebsocketRunnable()
{
  
}

void
WebsocketRunnable::StartThread()
{
  _thread = FRunnableThread::Create(this, TEXT("noderallyThread"), 0, TPri_BelowNormal); 
}

bool
WebsocketRunnable::Init()
{ 
  try 
  {
      _websocket->Connect(_connectionUrl);
      _connectionOk = true;
      _running = true;
      return true;
  } 
  catch ( std::runtime_error & err )
  {
      _connectionOk = false;
      std::string tmp = err.what();
      UE_LOG(WebsocketLog, Warning, TEXT("%s"), *FString(tmp.c_str()));
      
      return false;
  }
}


uint32 
WebsocketRunnable::Run()
{
  	const int WEBSOCKET_POLL_DELAY = 10;
    while( _running )
    {
        _websocket->Process(WEBSOCKET_POLL_DELAY);
    }
    return 0;
}

void
WebsocketRunnable::Stop()
{
  _running = false;
}

void
WebsocketRunnable::Exit()
{
  delete _websocket;
}

void
WebsocketRunnable::RequestExit()
{
  UE_LOG(WebsocketLog, Warning, TEXT("Exiting gracefully..."));
  _thread->Kill(true);
  UE_LOG(WebsocketLog, Warning, TEXT("Deleting thread ..."));
  delete _thread;
  _thread = nullptr;
}
