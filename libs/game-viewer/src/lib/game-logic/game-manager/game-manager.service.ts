import { Injectable } from '@angular/core';
import { KnightsGameScene } from '../scene/knights-game-scene';

@Injectable({
  providedIn: 'root',
})
export class GameManagerService {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private phaserGame: Phaser.Game;
  private config!: Phaser.Types.Core.GameConfig;

  constructor() {
    this.initConfiguration();
  }

  private initConfiguration(): void {
    this.config = {
      type: Phaser.WEBGL,
      height: '100%',
      width: '100%',
      scene: [KnightsGameScene],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 100 },
        },
      },
    };
  }

  public createGame(): void {
    this.phaserGame = new Phaser.Game(this.config);
    this.phaserGame.scale.autoCenter = Phaser.Scale.Center.CENTER_BOTH;
  }
}
