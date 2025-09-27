import { createReducer, on } from '@ngrx/store';
import { initialMultiplayerState } from './multiplayer.state';
import * as MultiplayerActions from './multiplayer.actions';

export const multiplayerReducer = createReducer(
  initialMultiplayerState,
  on(MultiplayerActions.updatePlayerPosition, (state, { id, pos }) => ({
    ...state,
    players: { ...state.players, [id]: pos }
  })),
  on(MultiplayerActions.removePlayer, (state, { id }) => {
    const newPlayers = { ...state.players };
    delete newPlayers[id];
    return { ...state, players: newPlayers };
  }),
  on(MultiplayerActions.setBots, (state, { bots }) => ({
    ...state,
    bots
  })),
  on(MultiplayerActions.updateBotPosition, (state, { id, pos }) => ({
    ...state,
    bots: { ...state.bots, [id]: pos }
  })),
  on(MultiplayerActions.botDied, (state, { id }) => {
    const { [id]: removed, ...rest } = state.bots;
    return { ...state, bots: rest };
  }),
  on(MultiplayerActions.spawnBullet, (state, { bullet }) => ({
    ...state,
    bullets: { ...state.bullets, [bullet.id]: bullet }
  })),
  on(MultiplayerActions.removeBullet, (state, { id }) => {
    const newBullets = { ...state.bullets };
    delete newBullets[id];
    return { ...state, bullets: newBullets };
  }),
  on(MultiplayerActions.updateBullet, (state, { bullet }) => ({
    ...state,
    bullets: { ...state.bullets, [bullet.id]: bullet }
  })),
  on(MultiplayerActions.spawnEnemyBullet, (state, { bullet }) => ({
    ...state,
    enemyBullets: { ...state.enemyBullets, [bullet.id]: bullet }
  })),
  on(MultiplayerActions.updateEnemyBullet, (state, { bullet }) => ({
    ...state,
    enemyBullets: { ...state.enemyBullets, [bullet.id]: bullet }
  })),
  on(MultiplayerActions.removeEnemyBullet, (state, { id }) => {
    const newEnemyBullets = { ...state.enemyBullets };
    delete newEnemyBullets[id];
    return { ...state, enemyBullets: newEnemyBullets };
  }),
  on(MultiplayerActions.setScore, (state, { score }) => ({ ...state, score })),
  on(MultiplayerActions.pauseGame, state => ({ ...state, isPaused: true })),
  on(MultiplayerActions.resumeGame, state => ({ ...state, isPaused: false })),
  on(MultiplayerActions.gameOver, state => ({ ...state, gameOver: true })),

  on(MultiplayerActions.playerHit, (state, { id, health }) => ({
    ...state,
    playerHit: { id, health }
  })),

  on(MultiplayerActions.clearPlayerHit, (state) => ({
    ...state,
    playerHit: null
  })),

  on(MultiplayerActions.playerDied, (state, { id }) => ({
    ...state,
    playerDied: { id }
  })),

  on(MultiplayerActions.clearPlayerDied, (state) => ({
    ...state,
    playerDied: null
  }))
);
