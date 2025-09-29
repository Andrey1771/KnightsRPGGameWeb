import { createReducer, on } from '@ngrx/store';
import { initialJoinLobbyState } from './join-lobby.state';
import * as JoinLobbyActions from './join-lobby.actions';

export const joinLobbyReducer = createReducer(
  initialJoinLobbyState,
  on(JoinLobbyActions.joinLobby, (state, { name, playerName }) => ({ ...state, lobbyName: name, playerName, loading: true, error: null })),
  on(JoinLobbyActions.joinLobbySuccess, state => ({ ...state, loading: false })),
  on(JoinLobbyActions.joinLobbyFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(JoinLobbyActions.resetJoinLobby, () => initialJoinLobbyState)
);
