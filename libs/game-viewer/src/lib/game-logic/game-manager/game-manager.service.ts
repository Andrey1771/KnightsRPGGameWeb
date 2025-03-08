import { Injectable } from '@angular/core';
import { KnightsGameScene } from '../scene/knights-game-scene';
import {MainMenuScene} from "../scene/main-menu-scene";
import {MultiplayerScene} from "../scene/multiplayer-scene";
import {SettingsScene} from "../scene/settings-scene";

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
      scene: [MainMenuScene, KnightsGameScene, MultiplayerScene, SettingsScene],
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
