export interface JoinLobbyState {
  lobbyName: string;
  playerName: string;
  loading: boolean;
  error: string | null;
}

export const initialJoinLobbyState: JoinLobbyState = {
  lobbyName: '',
  playerName: '',
  loading: false,
  error: null
};
