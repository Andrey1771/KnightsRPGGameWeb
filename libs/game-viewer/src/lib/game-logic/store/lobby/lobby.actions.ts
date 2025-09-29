import {createAction, props} from "@ngrx/store";
import {PlayerInfo} from "../../../models/player-info";

export const updatePlayers = createAction('[Lobby] Update Players', props<{ players: PlayerInfo[], leaderConnectionId: string }>());
export const startGame = createAction('[Lobby] Start Game', props<{ initialPositions: any, bots: any }>());
export const setLobbyParams = createAction('[Lobby] Set Lobby Params', props<{ lobbyName: string; playerName: string; maxPlayers: number }>());
export const resetLobby = createAction('[Lobby] Reset Lobby');
export const lobbyFailure = createAction('[Lobby] Lobby Failure', props<{ error: string }>());
