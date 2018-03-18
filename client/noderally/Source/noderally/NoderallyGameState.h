// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameStateBase.h"
#include "NoderallyGameState.generated.h"

/**
 *
 */
UCLASS()
class NODERALLY_API ANoderallyGameState : public AGameStateBase
{
  GENERATED_BODY()
public:
  

  
  // player order on track during match.
  // (if more checkpoints are used, this provides tools to
  // track it easily in real-time).

  // number of laps on current track
  UPROPERTY(BlueprintReadWrite, EditAnywhere)
  int numLaps;


  // name of the current track

  // All-time top 10 players.


  bool HasMatchStarted() const override;
  UFUNCTION(BlueprintCallable)
  bool StartMatch();


};
