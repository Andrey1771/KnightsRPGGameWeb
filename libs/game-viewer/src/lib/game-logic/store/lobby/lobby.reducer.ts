import { createReducer, on } from "@ngrx/store";
import { initialLobbyState } from "./lobby.state";
import * as LobbyActions from './lobby.actions';
import * as GameActions from '../game/game.actions';

export const lobbyReducer = createReducer(
  initialLobbyState,
  on(LobbyActions.setLobbyName, (state, { name }) => ({ ...state, lobbyName: name })),
  on(GameActions.updatePlayers, (state, { players, leaderConnectionId }) => ({ ...state, players, leaderConnectionId })),
  on(GameActions.startGame, state => ({ ...state, gameStarted: true })),
  on(LobbyActions.resetLobby, state => initialLobbyState)
);
