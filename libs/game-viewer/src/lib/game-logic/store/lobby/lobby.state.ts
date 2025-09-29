import { PlayerInfo } from "../../../models/player-info";

export interface LobbyState {
  lobbyName: string;
  players: PlayerInfo[];
  leaderConnectionId: string | null;
  gameStarted: boolean;

  error: string | null;
}

export const initialLobbyState: LobbyState = {
  lobbyName: '',
  players: [],
  leaderConnectionId: null,
  gameStarted: false,

  error: null
};
