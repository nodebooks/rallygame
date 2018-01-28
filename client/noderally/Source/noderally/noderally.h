// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"

DECLARE_LOG_CATEGORY_EXTERN(WebsocketLog, Log, All);

/// Enum for easier UI change.
UENUM(BlueprintType)
enum class EUIView : uint8 
{
  UI_Intro              UMETA(DisplayName="Intro view"),
  UI_Login              UMETA(DisplayName="Login view"),
  UI_Lobby_Tracks       UMETA(Displayname="Tracks view"),
  UI_Lobby_Races        UMETA(Displayname="Races view"),
  UI_Lobby_ResultBoard  UMETA(DisplayName="Result Board view"),
  UI_Waiting            UMETA(DisplayName="Waiting Race Start view"),
  UI_Racing             UMETA(DisplayName="Racing view")
};
