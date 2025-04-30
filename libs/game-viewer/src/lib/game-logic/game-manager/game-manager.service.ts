import { Injectable } from '@angular/core';
import { KnightsGameScene } from '../scene/knights-game-scene';
import { MainMenuScene } from "../scene/main-menu-scene";
import { MultiplayerScene } from "../scene/multiplayer-scene";
import { SettingsScene } from "../scene/settings-scene";
import { LobbyScene } from "../scene/lobby-scene";
import { CreateLobbyScene } from '../scene/create-lobby-scene';
import { JoinLobbyScene } from '../scene/join-lobby-scene';
import {SignalRService} from "../../services/signal-r-service/signal-r-service";

@Injectable({
  providedIn: 'root',
})
export class GameManagerService {
  private phaserGame!: Phaser.Game;
  private config!: Phaser.Types.Core.GameConfig;

  constructor(private _signalRService: SignalRService) {
    this.initConfiguration();
  }

  private initConfiguration(): void {
    this.config = {
      type: Phaser.WEBGL,
      height: '100%',
      width: '100%',
      scene: [MainMenuScene, KnightsGameScene, JoinLobbyScene, SettingsScene],
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

    this.phaserGame.scene.add('CreateLobbyScene', new CreateLobbyScene(this._signalRService));
    this.phaserGame.scene.add('LobbyScene', new LobbyScene(this._signalRService));
    this.phaserGame.scene.add('MultiplayerScene', new MultiplayerScene(this._signalRService));
    this.phaserGame.scene.add('JoinLobbyScene', new JoinLobbyScene(this._signalRService));
  }
}
