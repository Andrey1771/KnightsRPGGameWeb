import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LobbyState } from './lobby.state';

export const selectLobbyState =
  createFeatureSelector<LobbyState>('lobby');

export const selectLobbyName = createSelector(
  selectLobbyState,
  (state) => state.lobbyName
);

export const selectPlayers = createSelector(
  selectLobbyState,
  (state) => state.players
);

export const selectLeaderConnectionId = createSelector(
  selectLobbyState,
  (state) => state.leaderConnectionId
);

export const selectGameStarted = createSelector(
  selectLobbyState,
  (state) => state.gameStarted
);
