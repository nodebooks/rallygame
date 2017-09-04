// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include <string>
#include <libwebsockets.h>


class IReceiver 
{
public:
  virtual ~IReceiver(){}
  // Called wehen entire message has been processed. 
  virtual void OnReceive( const std::string & msg ) = 0;
};

/** Websocket client class.
 * 
 */
class NODERALLY_API Websocket
{
private:
  lws_context *             _context;
  lws *                     _ws;
  lws_context_creation_info _info;
  static lws_protocols      protocols[];
  
  IReceiver *               _receiver{nullptr};
  
  
public:

  
	 Websocket();
   virtual ~Websocket();
   
   static const int DEFAULT_PORT = 1337;
   void Connect(const std::string & url);
   void Process( int polldelay);
   

};
