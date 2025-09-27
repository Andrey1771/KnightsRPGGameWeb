import { PlayerInfo } from "../../../models/player-info";

export interface LobbyState {
  lobbyName: string;
  players: PlayerInfo[];
  leaderConnectionId: string | null;
  gameStarted: boolean;
}

export const initialLobbyState: LobbyState = {
  lobbyName: '',
  players: [],
  leaderConnectionId: null,
  gameStarted: false
};
