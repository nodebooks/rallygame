// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include <stack>
#include "Car.generated.h"

USTRUCT()
struct FNetworkData 
{
  
  GENERATED_BODY()
  // velocity in XY plane
  float velocityXY[2];
  // Euler rotation over Z.
  float rotationAngleZ;
  
  bool isThrottling;
  bool isBreaking;
};

UCLASS()
class NODERALLY_API ACar : public APawn
{
	GENERATED_BODY()

public:
	// Sets default values for this pawn's properties
	ACar();
  UPROPERTY(EditAnywhere,BlueprintReadWrite)
  USceneComponent * MeshComponent;
protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

  /// target data position.
  FNetworkData targetData; 
  bool bIsNetworkControlled;
public:	
	// Called every frame
	virtual void Tick(float DeltaTime) override;

	// Called to bind functionality to input
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

	UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
  float  throttle;
  
  UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
  float  maxThrottle;
  
  UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
  float  maxSpeed;

  UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
  float  turningSpeed;
  
  UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
  float  maxTurningSpeed;
  
  UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
  float drift;
  
  UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
  float breakFactor;
  
  UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
  float slowDownFactor;
  
  UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
	float maxSpeedOnDirt;
  
  UPROPERTY(EditAnywhere,BlueprintReadWrite,Category="CarControls")
	float dirtFactor;
  
  FVector   velocity;

  bool isThrottling;

  bool isBreaking;
  /// Dirt effect can be active from overlapping sources. 
  /// using stacked on-dirt tracking ensures effect is canceled 
  /// only when player clears all areas.
  std::stack<bool> dirtStack;
  
	UFUNCTION(BlueprintCallable)
  void Accelerate(float AxisValue);

  UFUNCTION(BlueprintCallable)
  void Deaccelerate(float AxisValue);

  UFUNCTION(BlueprintCallable)
  void Turn( float AxisValue);
    
  void OnNetworkSync( FNetworkData & data );
  FNetworkData GetSyncData();
  
  void HandleDeadReckoning();
  UFUNCTION(BlueprintCallable)
  void SetOnDirt();
  UFUNCTION(BlueprintCallable)
  void SetOffDirt();
  
  
  UFUNCTION(BlueprintCallable)
  void HandleTerrainBlockHit();
};
