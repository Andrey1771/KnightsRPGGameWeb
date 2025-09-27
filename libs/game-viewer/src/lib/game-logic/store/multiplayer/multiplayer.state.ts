import { PlayerPositionDto } from '../../../dto/player-position-dto';

export interface PlayerHitDto {
  id: string;
  health: number;
}

export interface PlayerDiedDto {
  id: string;
}

export interface MultiplayerState {
  players: Record<string, PlayerPositionDto>;
  bots: Record<string, PlayerPositionDto>;
  bullets: Record<string, any>;
  enemyBullets: Record<string, any>;
  score: number;
  isPaused: boolean;
  gameOver: boolean;

  playerHit: PlayerHitDto | null;
  playerDied: PlayerDiedDto | null;
}

export const initialMultiplayerState: MultiplayerState = {
  players: {},
  bots: {},
  bullets: {},
  enemyBullets: {},
  score: 0,
  isPaused: false,
  gameOver: false,

  playerHit: null,
  playerDied: null,
};
