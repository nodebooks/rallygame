// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerState.h"
#include "NoderallyPlayerState.generated.h"

/**
 * 
 */
UCLASS()
class NODERALLY_API ANoderallyPlayerState : public APlayerState
{
	GENERATED_BODY()
	
public:

  UFUNCTION(BlueprintNativeEvent)
  void OnMatchStart();
	
	
};
