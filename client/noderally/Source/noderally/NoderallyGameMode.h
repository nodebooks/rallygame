// Fill out your copyright notice in the Description page of Project Settings.

#pragma once


#include <Core.h>
#include <CoreMisc.h>
#include <CoreMinimal.h>

#include <UObjectGlobals.h>
#include <PaperTileMapActor.h>
#include <PaperTileSet.h>
#include <PaperTileMapComponent.h>
#include "GameFramework/Actor.h"
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

USTRUCT()
struct FNoderallyBlueprintTypes
{
  GENERATED_BODY()
  
  static UClass * TerrainOffTrack;
  static UClass * TerrainBlock;
  
  FNoderallyBlueprintTypes();
  
};

// Server reply data to measure delay.
struct ServerReplyData 
{
    uint32 timestamp; // Epoch value
    uint32 sequence; // logical value
    FString message; // message type
    bool valid{false}; 
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
  ServerReplyData serverReplyData;
  void SendServerReply();
  bool hasMatchStarted{false};
public:

  ANoderallyGameMode();

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
 
  void RegenerateTrack( TSharedPtr<FJsonObject> track );
 
  UFUNCTION(BlueprintCallable)
  void Authenticate(  const FPlayerAuth & playerAuth );
  
  UFUNCTION(BlueprintCallable)
  void NewPlayer( const FPlayerAuth & playerAuth );

  UFUNCTION(BlueprintCallable)
  void SendRaceUpdate(const FPlayerAuth & playerAuth );
  /// Events 
  
  UFUNCTION(BlueprintNativeEvent)
  void OnPlayerAuthenticationSuccess( const FPlayerAuth & auth ) ;

  /// Called when authentication fails.
  UFUNCTION(BlueprintNativeEvent)
  void OnPlayerAuthenticationFail( const FPlayerAuth & auth ) ;
  
  UFUNCTION(BlueprintNativeEvent)
  void OnNewPlayerSuccess( const FPlayerAuth & auth ) ;

  UFUNCTION(BlueprintNativeEvent)
  void OnNewPlayerFail( const FPlayerAuth & auth ) ;
  
  UFUNCTION(BlueprintNativeEvent)
  void OnConnectionFailed();
  
  UFUNCTION(BlueprintNativeEvent)
  void OnConnectionEstablished();
  
  UFUNCTION(BlueprintCallable)
  bool LoadTrack();
  
  UFUNCTION(BlueprintNativeEvent)
  void OnMatchStart();
  
  UFUNCTION(BlueprintNativeEvent)
  void OnMatchEnd();
  
  //virtual void StartPlay() override;
  virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;
  
  virtual bool HasMatchStarted() const override;
  UFUNCTION(BlueprintCallable)
  bool StartMatch();
  
  

  /// \TODO
  /* On Match Start / HandleMatchStart should call RestartPlayer(player controller);.*/
  /* match state must be set and handling callback executed in game mode.*/
  
  // where is player controller created? In Game Mode, with RestartPlayer. 
  // Needs overriding in GameModeBP in order to make  spawning possible even 
  // when colliding.
  // 
  // player start is defined using AController's StartSpot AActor reference.
  //   // http://api.unrealengine.com/INT/API/Runtime/Engine/GameFramework/AController/index.html
};

