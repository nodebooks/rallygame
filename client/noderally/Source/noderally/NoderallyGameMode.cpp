// Fill out your copyright notice in the Description page of Project Settings.


#include "NoderallyGameMode.h"
#include "noderally.h"
#include <Public/EngineUtils.h>
#include <UObject/ConstructorHelpers.h>
#include <Classes/Components/BoxComponent.h>
#include <Classes/Engine/TargetPoint.h>
using namespace std;


UClass * FNoderallyBlueprintTypes::TerrainBlock = nullptr;
UClass * FNoderallyBlueprintTypes::TerrainOffTrack = nullptr;

FNoderallyBlueprintTypes::FNoderallyBlueprintTypes()
{
  static ConstructorHelpers::FObjectFinder<UBlueprint> terrainOffTrack(TEXT("Blueprint'/Game/Blueprints/TerrainOffTrack'"));
  if ( terrainOffTrack.Succeeded() ) TerrainOffTrack = terrainOffTrack.Object->GeneratedClass;
  
  static ConstructorHelpers::FObjectFinder<UBlueprint> terrainBlock(TEXT("Blueprint'/Game/Blueprints/TerrainBlock'"));
  if ( terrainBlock.Succeeded() ) TerrainBlock = terrainBlock.Object->GeneratedClass;
}

ANoderallyGameMode::ANoderallyGameMode()
{
  FNoderallyBlueprintTypes noderallyTypes;  
}

void
ANoderallyGameMode::SendWithWebsocket( TSharedRef<FJsonObject> & json ) const
{
  FString output;
  // create writer for json
  TSharedRef<TJsonWriter<TCHAR>> writer = TJsonWriterFactory<>::Create(&output);
  // serialize json object
  FJsonSerializer::Serialize(json, writer);  
  
  std::string strOut( TCHAR_TO_UTF8(*output) );
  
  if ( _wsRunnable == nullptr ) 
  {
    UE_LOG(WebsocketLog, Error, TEXT("Attempted to write websocket without connecting!"));
  }
  else 
  {
    _wsRunnable->_websocket->Send(strOut);
  }
}

void 
ANoderallyGameMode::ConnectWebsocket()
{
  
  FString hostAndPort = host + ":"+ FString::FromInt(serverPort);
  std::string url(TCHAR_TO_UTF8(*hostAndPort));
   
  try 
  {
    
    _wsRunnable = new WebsocketRunnable(url);
    _wsRunnable->StartThread();
    // Set receiver
    _wsRunnable->_websocket->SetReceiver(this);
	
    UE_LOG(WebsocketLog, Warning, TEXT("good to go!"));
  } 
  catch (runtime_error & err )
  {
      UE_LOG(WebsocketLog, Error, TEXT("Websocket connection error %s "), *FString(err.what()));
      
  }
}

void
ANoderallyGameMode::DisconnectWebsocket()
{
  _wsRunnable->RequestExit();
  delete _wsRunnable;
  _wsRunnable = nullptr;
}

void 
ANoderallyGameMode::OnReceive(const std::string& msg)
{

  TSharedPtr<FJsonObject> jsonObject(new FJsonObject);
  TSharedRef<TJsonReader<>> reader = TJsonReaderFactory<>::Create(msg.c_str());
  FJsonSerializer::Deserialize(reader, jsonObject);
  FString message = jsonObject->GetStringField(TEXT("message"));
  
  
  if ( message == "login" )
  {
    
    FString tmp;
    TSharedPtr<FPlayerAuth> auth(new FPlayerAuth);
    bool result = jsonObject->GetBoolField(TEXT("response"));
    (*auth).username = TCHAR_TO_UTF8(*jsonObject->GetStringField(TEXT("username")));
    if ( result )
    {
      AsyncTask(ENamedThreads::GameThread, [this,auth]() {
        this->OnPlayerAuthenticationSuccess(*auth);      
      });
    }
    else
    {
      if ( jsonObject->TryGetStringField(TEXT("reason"), tmp) )
      {
        auth->reason = tmp;
      }
      AsyncTask(ENamedThreads::GameThread, [this,auth]() {
        this->OnPlayerAuthenticationFail(*auth);      
      });  
    }
  }
  else if ( message == "connection_fail")
  {
    AsyncTask(ENamedThreads::GameThread, [this]() {
        this->OnConnectionFailed();      
    }); 
  }
  else if ( message == "connection_established")
  {
    AsyncTask(ENamedThreads::GameThread, [this]() {
        this->OnConnectionEstablished();      
    }); 
  }
  else
  {
    UE_LOG(WebsocketLog, Warning, TEXT("Unhandled websocket message:%s"), *FString(msg.c_str()));
  }
}  
    
void ANoderallyGameMode::Authenticate( const FPlayerAuth& playerAuth)
{
  TSharedRef<FJsonObject> json = MakeShareable(new FJsonObject());
  
  json->SetStringField("message", "login");
  json->SetStringField("username", playerAuth.username);
  json->SetStringField("password", playerAuth.password);
    
  SendWithWebsocket(json);
  
}

void ANoderallyGameMode::OnPlayerAuthenticationSuccess_Implementation(const FPlayerAuth& auth)
{
}

void ANoderallyGameMode::OnPlayerAuthenticationFail_Implementation(const FPlayerAuth& auth)
{
}

void ANoderallyGameMode::OnConnectionEstablished_Implementation()
{
  
}

void ANoderallyGameMode::OnConnectionFailed_Implementation()
{
  
}

bool ANoderallyGameMode::LoadTrack() 
{
  FString track;
  if ( FFileHelper::LoadFileToString(track, 
                                    TEXT("/home/entity/workdir/noderally/assets/noderally-basetrack.json"), 
                                    (FFileHelper::EHashOptions)0 ))
  {
    TSharedPtr<FJsonObject> jsonObject(new FJsonObject);
    TSharedRef<TJsonReader<>> reader = TJsonReaderFactory<>::Create(track);
    FJsonSerializer::Deserialize(reader, jsonObject);
    RegenerateTrack( jsonObject );
  }
  else 
  {
    UE_LOG(WebsocketLog, Warning, TEXT("Could not load track file."));
  }
  return true;
}



void
ANoderallyGameMode::RegenerateTrack( TSharedPtr<FJsonObject> track )
{
  
  UE_LOG(WebsocketLog, Log, TEXT("REGENERATE TRACK"));
  
  
  // Access our tilemap from world
  APaperTileMapActor *tilemap = nullptr;
  for (TActorIterator<APaperTileMapActor> It(GetWorld()); It; ++It)
  {
    tilemap = *It;
  }
  
  if ( tilemap != nullptr )
  {
    
    UPaperTileMapComponent * comp = tilemap->GetRenderComponent();
    int32 width;
    int32 height;
    int32 numLayers;
    comp->GetMapSize(width, height, numLayers);
    // This is required to make changes on the fly.
    comp->MakeTileMapEditable();
    // Load tileset from assets
    UPaperTileSet *ts = Cast<UPaperTileSet>(
                          StaticLoadObject( UPaperTileSet::StaticClass(),
                                            NULL, 
                                            TEXT("/Game/track_TileSet.track_TileSet")
                                          )
                        );
    UPaperTileSet *backgroundTileSet = Cast<UPaperTileSet>(StaticLoadObject( UPaperTileSet::StaticClass(), NULL, TEXT("/Game/sands_contrast_TileSet.sands_contrast_TileSet")));
    if ( ts == nullptr )
    {
      GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red, TEXT("CAnnot load track2 tileset "));
    }
    
    int version = (int)track->GetNumberField("version");
    //int height = (int)json->GetNumberField("height");
    //int width  = (int)json->GetNumberField("width");
        
    TArray <TSharedPtr<FJsonValue>> layers = track->GetArrayField("layers");
    for( auto & layer : layers )
    {
      FString layerName;
      // skip unnamed layers
      if ( layer->AsObject()->TryGetStringField("name", layerName) == false ) continue;
      if ( layerName.Len() == 0) continue;
      
      
      if ( layerName == TEXT("Track"))
      {
        TArray <TSharedPtr<FJsonValue>> data = layer->AsObject()->GetArrayField("data");
        FString tmp("number of data entries ");
        tmp.AppendInt(data.Num());
        GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red, tmp);
        for(int i=0;i<data.Num();i++)
        {
          int32 y = i / width;
          int32 x = i % width;
          int32 tileIndex = (int32)data[i]->AsNumber();
          
          FPaperTileInfo info = comp->GetTile(x,y, 0);
          info.PackedTileIndex = tileIndex-101;
          // In case tileset index is zero, mark tile unused (tileset is null)
          if ( tileIndex == 0 ) info.TileSet = nullptr;
          else                  info.TileSet = ts;
            
          comp->SetTile(x,y,0,info);	  
          //cout << y << "," << x << " - tile index: "<< tileIndex << "\n";
        }
      }
      else if ( layerName == "Background")
      {
        TArray <TSharedPtr<FJsonValue>> data = layer->AsObject()->GetArrayField("data");
        
        FString tmp("number of data entries ");
        tmp.AppendInt(data.Num());
        GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red, tmp);
        for(int i=0;i<data.Num();i++)
        {
          int32 y = i / width;
          int32 x = i % width;
          int32 tileIndex = (int32)data[i]->AsNumber();
          
          FPaperTileInfo info = comp->GetTile(x,y, 0);
          info.PackedTileIndex = tileIndex-1;
          // In case tileset index is zero, mark tile unused (tileset is null)
          if ( tileIndex == 0 ) info.TileSet = nullptr;
          else                  info.TileSet = backgroundTileSet;
            
          comp->SetTile(x,y,1,info);	  
        }
      }
      else if ( layerName == "Colliders")
      {
          TArray <TSharedPtr<FJsonValue>> colliders = layer->AsObject()->GetArrayField("objects");
          for(auto & collider : colliders)
          {
              TSharedPtr<FJsonObject> obj = collider->AsObject();
              float tmpHeight = obj->GetNumberField("height");
              float tmpWidth = obj->GetNumberField("width");
              float tmpX = obj->GetNumberField("x");
              float tmpY = obj->GetNumberField("y");
              FString tmpName = obj->GetStringField("name");
              int tmpId = obj->GetNumberField("id");
              
              FActorSpawnParameters spawnParams;
              
              
              
              AActor *offtrack = GetWorld()->SpawnActor(FNoderallyBlueprintTypes::TerrainOffTrack, 
                                                        &FTransform::Identity, 
                                                        spawnParams);
              
              UBoxComponent *box = offtrack->FindComponentByClass<UBoxComponent>();
              // Extent is defined to be the half of the size
              box->SetBoxExtent(FVector(tmpWidth*0.5,tmpHeight*0.5, 1.0));
              // Take into account origin in actor; in Tiled it is top left corner
              // instead of center as in UE4.
              offtrack->SetActorLocation(FVector(tmpX+tmpWidth*0.5,tmpY+tmpHeight*0.5,0.0));
              
              
          }
      }
      else if ( layerName == "Spawnpoints")
      {
          TArray <TSharedPtr<FJsonValue>> spawnpoints = layer->AsObject()->GetArrayField("objects");
          for(auto & spawnpoint : spawnpoints)
          {
              TSharedPtr<FJsonObject> obj = spawnpoint->AsObject();
              float tmpX = obj->GetNumberField("x");
              float tmpY = obj->GetNumberField("y");
              float tmpWidth = obj->GetNumberField("width");
              FString tmpName = obj->GetStringField("name");
              
              FActorSpawnParameters spawnParams;
              
              ATargetPoint *startPosition = GetWorld()->SpawnActor<ATargetPoint>(spawnParams);
              startPosition->SetActorLocation(FVector(tmpX+tmpWidth*0.5,tmpY+tmpWidth*0.5,0.0));
              startPosition->Tags.Add(FName(*tmpName));
              
          }
      }
    }
    
    
    
    
    if ( GEngine )
    {
      //ostringstream ss;
      //ss << "Map size: " << width << "x" << height << ", #layers = " << numLayers;
      //FPaperTileInfo info = comp->GetTile(0,0,0);
      //FPaperTileInfo info2 = comp->GetTile(2,2,0);
      //comp->SetTile( 0,0,0, info2);
      //GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Yellow, FString(ss.str().c_str()));      
      
    }
  }
  
}
