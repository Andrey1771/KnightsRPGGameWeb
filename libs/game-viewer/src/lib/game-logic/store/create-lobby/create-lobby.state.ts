export interface CreateLobbyState {
  lobbyName: string;
  loading: boolean;
  error: string | null;
  playerName: string;
  players: string[];
  maxPlayers: number;
}

export const initialCreateLobbyState: CreateLobbyState = {
  lobbyName: '',
  loading: false,
  error: null,
  playerName: "",
  players: [],
  maxPlayers: 0
};
