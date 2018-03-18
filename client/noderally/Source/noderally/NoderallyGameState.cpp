// Fill out your copyright notice in the Description page of Project Settings.


#include "NoderallyGameState.h"

/*
void
ANoderallyGameState::HandleBeginPlay()
{
  GetWorldSettings()->NotifyBeginPlay();
}
 * */

bool
ANoderallyGameState::HasMatchStarted() const
{
  UE_LOG(LogTemp, Warning, TEXT("Match Start Query"));
  return true;
}

bool
ANoderallyGameState::StartMatch()
{

  GetWorldSettings()->NotifyMatchStarted();
  numLaps = 3;
  return true;
}
