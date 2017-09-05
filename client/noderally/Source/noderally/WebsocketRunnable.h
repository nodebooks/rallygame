// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include <ThreadingBase.h>
#include <Websocket.h>
#include "CoreMinimal.h"
#include <string>
/**
 * 
 */
class NODERALLY_API WebsocketRunnable : FRunnable
{
private:
  std::string _connectionUrl;
  bool        _connectionOk;
  bool        _running;
public:

  Websocket * _websocket{nullptr};
  FRunnableThread * _thread{nullptr};
  
  WebsocketRunnable(const std::string & url );
  virtual ~WebsocketRunnable();
  
  bool Init() override;
  uint32 Run() override;
  void Stop() override;
  void Exit() override;
  
  void StartThread();
  void RequestExit();

};
