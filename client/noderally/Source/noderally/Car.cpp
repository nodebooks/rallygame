// Fill out your copyright notice in the Description page of Project Settings.


#include "Car.h"

// Sets default values
ACar::ACar()
{
 	// Set this pawn to call Tick() every frame.  You can turn this off to improve performance if you don't need it.
	PrimaryActorTick.bCanEverTick = true;
  bIsNetworkControlled = false;
  RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("RootComponent"));
  MeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("MeshComponent"));
  MeshComponent->AttachToComponent(RootComponent, FAttachmentTransformRules::KeepRelativeTransform);
  
  // reasonable default values
  maxThrottle = 10.0;
  maxSpeed = 15.0;
  maxTurningSpeed = 100.0;
  breakFactor = 2.0;
  slowDownFactor = 1.0;
  maxSpeedOnDirt = 1.5;
  dirtFactor = 3.0;
  
}

// Called when the game starts or when spawned
void ACar::BeginPlay()
{
	Super::BeginPlay();
  dirtStack = std::stack<bool>();
}

// Called every frame
void ACar::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
  
  if ( isThrottling )
  {
    throttle = FMath::Clamp(throttle, -maxThrottle, maxThrottle);
    velocity += throttle * DeltaTime * GetActorForwardVector();
  }
  // put a cap to how fast car can go
  velocity = velocity.GetClampedToMaxSize(maxSpeed);  
  if ( isBreaking )
  {
    if ( velocity.SizeSquared() > 0.0f ) {
      FVector slowDown = (velocity * (breakFactor / velocity.SizeSquared()) * DeltaTime);
      if ( slowDown.SizeSquared() > velocity.SizeSquared() )
        velocity.Set(0.0f, 0.0f, 0.0f);
      else
        velocity -= slowDown;
    } 
  }
  
  // put cap to how fast car moves off-track
  if ( dirtStack.empty() == false )
  {
    if ( velocity.SizeSquared() > maxSpeedOnDirt*maxSpeedOnDirt ) {
      
      FVector dirtSlowDown = (velocity * dirtFactor * DeltaTime);
      if (dirtSlowDown.SizeSquared() > velocity.SizeSquared())
        velocity = velocity.GetClampedToMaxSize(maxSpeedOnDirt);
      else
        velocity-=dirtSlowDown;
    }
  }
  
  FVector fwdVelocity     = GetActorForwardVector() * (velocity | GetActorForwardVector());
  FVector lateralVelocity = GetActorRightVector() * (velocity | GetActorRightVector());
  // lateral velocity decreases over time.
  velocity = fwdVelocity + (lateralVelocity * drift);
  FVector newLocation = GetActorLocation();
  newLocation += velocity;
     
  SetActorLocation(newLocation);
  
  FRotator rot = GetActorRotation();
  rot.Yaw += (turningSpeed * DeltaTime);
  SetActorRotation(rot);
  // decrease velocity
  velocity -= velocity * slowDownFactor * DeltaTime;
 
}

// Called to bind functionality to input
void ACar::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

}

void
ACar::Accelerate(float AxisValue)
{
  
  isThrottling = AxisValue > 0.001f;
  
  throttle = AxisValue*maxThrottle;
}

void
ACar::Deaccelerate(float AxisValue)
{
  isBreaking = ( AxisValue > 0.001f ); 
}

void
ACar::Turn( float AxisValue)
{
  turningSpeed = FMath::Clamp(AxisValue, -1.0f, 1.0f)*maxTurningSpeed;
}

void 
ACar::OnNetworkSync(FNetworkData& data)
{
  targetData = data;
}

void
ACar::HandleDeadReckoning()
{
  FVector targetVelocity(targetData.velocityXY[0], targetData.velocityXY[1], 0.0f);
  FQuat targetRotation = FQuat(GetActorUpVector(), targetData.rotationAngleZ);
  
  velocity = FMath::Lerp(velocity, targetVelocity, 0.1);
  //FQuat::Slerp( GetActorRotation().)
  isBreaking = targetData.isBreaking;
  isThrottling = targetData.isThrottling;
  
}
void ACar::SetOnDirt()
{
  dirtStack.push(true);
  isThrottling = false;
}
void ACar::SetOffDirt()
{
  if ( !dirtStack.empty())
    dirtStack.pop();
}

void ACar::HandleTerrainBlockHit()
{
    isThrottling = false;
    isBreaking = false;
    
    velocity=-velocity.GetUnsafeNormal();
    
    FVector newLocation = GetActorLocation();
    newLocation+=velocity;
    SetActorLocation(newLocation);
}

FNetworkData ACar::GetSyncData()
{
  return targetData;
}
