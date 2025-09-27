import { createAction, props } from '@ngrx/store';

export const createLobby = createAction('[CreateLobby] Create Lobby', props<{ lobbyName: string; playerName: string; maxPlayers: number }>());
export const createLobbySuccess = createAction('[CreateLobby] Create Lobby Success', props<{ lobbyName: string }>());
export const createLobbyFailure = createAction('[CreateLobby] Create Lobby Failure', props<{ error: string }>());
export const updatePlayers = createAction('[CreateLobby] Update Players', props<{ players: string[] }>());
export const resetCreateLobby = createAction('[CreateLobby] Reset');
