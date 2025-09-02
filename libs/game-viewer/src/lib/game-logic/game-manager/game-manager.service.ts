import { Injectable } from '@angular/core';
import { KnightsGameScene } from '../scene/knights-game-scene';
import { MainMenuScene } from "../scene/main-menu-scene";
import { MultiplayerScene } from "../scene/multiplayer-scene";
import { SettingsScene } from "../scene/settings-scene";
import { LobbyScene } from "../scene/lobby-scene";
import { CreateLobbyScene } from '../scene/create-lobby-scene';
import { JoinLobbyScene } from '../scene/join-lobby-scene';
import { SignalRService } from "../../services/signal-r-service/signal-r-service";
import { PhaserMusicService } from '../../services/phaser-music-service/phaser-music-service';
import { PreloaderScene } from "../scene/preloader-scene";
import { UIOverlayScene } from '../scene/ui-overlay-scene';
import { ThisReceiver } from "@angular/compiler";

@Injectable({
  providedIn: 'root',
})
export class GameManagerService {
  private phaserGame!: Phaser.Game;
  private config!: Phaser.Types.Core.GameConfig;

  constructor(private _signalRService: SignalRService, private _phaserMusicService: PhaserMusicService) {
    this.initConfiguration();
  }

  private initConfiguration(): void {
    const targetWidth = 640;
    const targetHeight = 960;

    this.config = {
      type: Phaser.WEBGL,
      backgroundColor: '#000000',
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [PreloaderScene, MainMenuScene, KnightsGameScene, JoinLobbyScene, SettingsScene, UIOverlayScene],
      scale: {
        mode: Phaser.Scale.FIT, // сохраняет пропорции и масштабирует
        autoCenter: Phaser.Scale.CENTER_BOTH, // центрирует игру
        width: targetWidth,
        height: targetHeight
      },
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
        },
      },
      fps: {
        target: 30,
        forceSetTimeOut: true
      }
    };
  }

  public createGame(): void {
    this.phaserGame = new Phaser.Game(this.config);

    this.phaserGame.scene.add('MainMenuScene', new MainMenuScene(this._phaserMusicService));
    this.phaserGame.scene.add('CreateLobbyScene', new CreateLobbyScene(this._signalRService));
    this.phaserGame.scene.add('LobbyScene', new LobbyScene(this._signalRService));
    this.phaserGame.scene.add('MultiplayerScene', new MultiplayerScene(this._signalRService, this._phaserMusicService));
    this.phaserGame.scene.add('JoinLobbyScene', new JoinLobbyScene(this._signalRService));
    this.phaserGame.scene.add('SettingsScene', new SettingsScene(this._phaserMusicService));
    this.phaserGame.scene.add('UIOverlayScene', new UIOverlayScene(this._phaserMusicService));

  }
}
