import { createReducer, on } from '@ngrx/store';
import { initialCreateLobbyState } from './create-lobby.state';
import * as CreateLobbyActions from './create-lobby.actions';

export const createLobbyReducer = createReducer(
  initialCreateLobbyState,
  on(CreateLobbyActions.createLobby, (state, { lobbyName, playerName, maxPlayers }) => ({
    ...state,
    lobbyName,
    playerName,
    maxPlayers,
    loading: true,
    error: null
  })),
  on(CreateLobbyActions.createLobbySuccess, (state, { lobbyName }) => ({ ...state, loading: false, lobbyName })),
  on(CreateLobbyActions.createLobbyFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(CreateLobbyActions.updatePlayers, (state, { players }) => ({ ...state, players })),
  on(CreateLobbyActions.resetCreateLobby, () => initialCreateLobbyState)
);
