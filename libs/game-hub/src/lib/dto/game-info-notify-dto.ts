import {PlayerInfoDto} from "./player-info-dto";
import {MapInfoDto} from "./map-info-dto";
import {ObjectInfoDto} from "./object-info-dto";

export interface GameInfoNotifyDto {
  playerInfoDto: PlayerInfoDto;
  mapInfoDto: MapInfoDto;
  objectInfoDto: ObjectInfoDto;
}
