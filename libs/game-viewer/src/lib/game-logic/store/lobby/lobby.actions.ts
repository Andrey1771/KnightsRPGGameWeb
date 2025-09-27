import {createAction, props} from "@ngrx/store";

export const setLobbyName = createAction('[Lobby] Set Lobby Name', props<{ name: string }>());
export const resetLobby = createAction('[Lobby] Reset Lobby');
