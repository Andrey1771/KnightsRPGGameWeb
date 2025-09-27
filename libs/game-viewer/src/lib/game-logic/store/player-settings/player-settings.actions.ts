import { createAction, props } from '@ngrx/store';

export const setPlayerName = createAction(
  '[Player] Set Name',
  props<{ name: string }>()
);


export const generateRandomName = createAction('[Player] Generate Random Name');
