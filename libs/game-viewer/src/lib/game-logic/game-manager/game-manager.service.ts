import { Injectable } from '@angular/core';
import { KnightsGameScene } from '../scene/knights-game-scene';

@Injectable({
  providedIn: 'root',
})
export class GameManagerService {
  private phaserGame!: Phaser.Game;
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
      scale: {
        mode: Phaser.Scale.ScaleModes.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { /*y: 100*/ },
        },
      },
    };
  }

  public createGame(): void {
    this.phaserGame = new Phaser.Game(this.config);
  }
}
