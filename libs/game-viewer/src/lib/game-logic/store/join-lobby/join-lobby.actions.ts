import { createAction, props } from '@ngrx/store';

export const joinLobby = createAction('[JoinLobby] Join Lobby', props<{ name: string; playerName: string; }>());
export const joinLobbySuccess = createAction('[JoinLobby] Join Lobby Success');
export const joinLobbyFailure = createAction('[JoinLobby] Join Lobby Failure', props<{ error: string }>());
