// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "Websocket.h"
#include "WebsocketRunnable.h"
#include "NoderallyGameMode.generated.h"

USTRUCT(BlueprintType)
struct FPlayerAuth 
{
    GENERATED_BODY()
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString username;
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString password;
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString reason; 
    
};
/**
 * 
 */
UCLASS()
class NODERALLY_API ANoderallyGameMode : public AGameModeBase, public IReceiver
{
	GENERATED_BODY()
  
protected:  
  void SendWithWebsocket( TSharedRef<FJsonObject> & json) const;
  
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
  
  void OnReceive( const std::string & msg ) override;
 
  UFUNCTION(BlueprintCallable)
  void Authenticate(  const FPlayerAuth & playerAuth );
  
  /// Events 
  
  UFUNCTION(BlueprintNativeEvent)
  void OnPlayerAuthenticationSuccess( const FPlayerAuth & auth ) ;

  /// Called when authentication fails.
  UFUNCTION(BlueprintNativeEvent)
  void OnPlayerAuthenticationFail( const FPlayerAuth & auth ) ;
};

