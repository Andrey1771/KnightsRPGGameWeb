import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlayerSettingsState } from './player-settings.reducer';

//TODO Deprecated Selectors
export const selectPlayerState = createFeatureSelector<PlayerSettingsState>('playerSettings');

export const selectPlayerName = createSelector(
  selectPlayerState,
  (state) => state.name
);
