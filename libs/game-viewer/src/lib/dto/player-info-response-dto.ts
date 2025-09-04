import {PlayerInfo} from "../models/player-info";

export interface PlayerInfoResponseDto {
  playerInfos: PlayerInfo[],
  leaderConnectionId: string
}
