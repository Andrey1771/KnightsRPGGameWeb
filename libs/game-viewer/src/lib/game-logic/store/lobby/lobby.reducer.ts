import { createReducer, on } from "@ngrx/store";
import { initialLobbyState } from "./lobby.state";
import * as LobbyActions from './lobby.actions';

export const lobbyReducer = createReducer(
  initialLobbyState,
  on(LobbyActions.setLobbyParams, (state, { lobbyName }) => ({ ...state, lobbyName })),
  on(LobbyActions.updatePlayers, (state, { players, leaderConnectionId }) => ({ ...state, players, leaderConnectionId })),
  on(LobbyActions.startGame, state => ({ ...state, gameStarted: true })),
  on(LobbyActions.resetLobby, state => initialLobbyState)
);
