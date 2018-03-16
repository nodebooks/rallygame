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
  //virtual void HandleBeginPlay() override;

	
	bool HasMatchStarted() const override;
  UFUNCTION(BlueprintCallable)
  bool StartMatch();
	

};
