// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "Websocket.h"
#include "WebsocketRunnable.h"
#include "NoderallyGameMode.generated.h"

/**
 * 
 */
UCLASS()
class NODERALLY_API ANoderallyGameMode : public AGameModeBase
{
	GENERATED_BODY()
public:
  UPROPERTY(EditAnywhere,BlueprintReadWrite)
  FString host;
  UPROPERTY(EditAnywhere,BlueprintReadWrite)
  int     serverPort;
  
  WebsocketRunnable * _wsRunnable{nullptr};
  
  UFUNCTION(BlueprintCallable)
  void ConnectWebsocket();
  UFUNCTION(BlueprintCallable)
  void DisconnectWebsocket();
  
 

};

