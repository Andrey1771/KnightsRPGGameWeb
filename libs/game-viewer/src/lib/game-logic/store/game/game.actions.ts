import { createAction, props } from "@ngrx/store";
import { PlayerInfo } from "../../../models/player-info";

export const updatePlayers = createAction('[Game] Update Players', props<{ players: PlayerInfo[], leaderConnectionId: string }>());
export const startGame = createAction('[Game] Start Game', props<{ initialPositions: any, bots: any }>());
