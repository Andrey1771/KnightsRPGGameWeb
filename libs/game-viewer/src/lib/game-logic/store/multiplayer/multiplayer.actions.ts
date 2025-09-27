import { createAction, props } from '@ngrx/store';
import { PlayerPositionDto } from "../../../dto/player-position-dto";

export const updatePlayerPosition = createAction('[Multiplayer] Update Player Position', props<{ id: string, pos: PlayerPositionDto }>());
export const removePlayer = createAction('[Multiplayer] Remove Player', props<{ id: string }>());
export const setBots = createAction('[Multiplayer] Set Bots', props<{ bots: Record<string, PlayerPositionDto> }>());
export const updateBotPosition = createAction('[Multiplayer] Update Bot Position', props<{ id: string, pos: PlayerPositionDto }>());
export const botDied = createAction('[Multiplayer] Bot Died', props<{ id: string }>());
export const spawnBullet = createAction('[Multiplayer] Spawn Bullet', props<{ bullet: any }>());
export const removeBullet = createAction('[Multiplayer] Remove Bullet', props<{ id: string }>());
export const updateBullet = createAction('[Multiplayer] Update Bullet', props<{ bullet: any }>());
export const spawnEnemyBullet = createAction('[Multiplayer] Spawn Enemy Bullet', props<{ bullet: any }>());
export const updateEnemyBullet = createAction('[Multiplayer] Update Enemy Bullet', props<{ bullet: any }>());
export const removeEnemyBullet = createAction('[Multiplayer] Remove Enemy Bullet', props<{ id: string }>());
export const setScore = createAction('[Multiplayer] Set Score', props<{ score: number }>());
export const pauseGame = createAction('[Multiplayer] Pause Game');
export const resumeGame = createAction('[Multiplayer] Resume Game');
export const gameOver = createAction('[Multiplayer] Game Over');
export const playerHit = createAction('[Multiplayer] Player Hit', props<{ id: string; health: number }>());
export const playerDied = createAction('[Multiplayer] Player Died', props<{ id: string }>());
export const clearPlayerHit = createAction('[Multiplayer] Clear Player Hit');
export const clearPlayerDied = createAction('[Multiplayer] Clear Player Died');


export const saveResult = createAction('[Multiplayer] Save Result', props<{ playerName: string; score: number }>());
export const saveResultSuccess = createAction('[Multiplayer] Save Result Success');
export const saveResultFailure = createAction('[Multiplayer] Save Result Failure', props<{ error: any }>());
