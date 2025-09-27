import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MultiplayerState } from './multiplayer.state';

export const selectMultiplayerState =
  createFeatureSelector<MultiplayerState>('multiplayer');

export const selectScore = createSelector(
  selectMultiplayerState,
  (state) => state.score
);
export const selectGameOver = createSelector(
  selectMultiplayerState,
  (state) => state.gameOver
);
