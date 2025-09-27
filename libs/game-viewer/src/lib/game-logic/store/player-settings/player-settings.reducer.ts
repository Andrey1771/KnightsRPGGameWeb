import { createReducer, on } from '@ngrx/store';
import * as PlayerActions from './player-settings.actions';
import { generateFunnyNick } from '../../../utils/nick-generator';

export interface PlayerSettingsState {
  name: string;
}

export const initialState: PlayerSettingsState = {
  name: '',
};

export const playerSettingsReducer = createReducer(
  initialState,
  on(PlayerActions.setPlayerName, (state, { name }) => ({ ...state, name })),
  on(PlayerActions.generateRandomName, (state) => ({
    ...state,
    name: generateFunnyNick()
  }))
);
