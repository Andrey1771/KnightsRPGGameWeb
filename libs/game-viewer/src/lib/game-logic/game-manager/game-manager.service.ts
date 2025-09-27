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

import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { SpaceBackgroundScene } from '../scene/space-background-scene';
import { GameOverScene } from "../scene/game-over-scene";
import { Store } from '@ngrx/store';
import { MultiplayerState } from '../store/multiplayer/multiplayer.state';
import { JoinLobbyState } from "../store/join-lobby/join-lobby.state";
import { CreateLobbyState } from "../store/create-lobby/create-lobby.state";
import { LobbyState } from '../store/lobby/lobby.state';
import { PlayerSettingsState } from '../store/player-settings/player-settings.reducer';

@Injectable({ providedIn: 'root' })
export class GameManagerService {
  private phaserGame!: Phaser.Game;
  private config!: Phaser.Types.Core.GameConfig;

  constructor(
    private _signalRService: SignalRService,
    private _phaserMusicService: PhaserMusicService,
    private _playerSettingsStore: Store<{ playerSettings: PlayerSettingsState }>,
    private _multiplayerStore: Store<{ multiplayer: MultiplayerState }>,
    private _joinLobbyStore: Store<{ joinLobby: JoinLobbyState }>,
    private _createLobbyStore: Store<{ createLobby: CreateLobbyState }>,
    private _lobbyStore: Store<{ lobby: LobbyState }>
  ) {
    this.initConfiguration();
  }

  private initConfiguration(): void {
    const targetWidth = 1280;
    const targetHeight = 720;

    this.config = {
      type: Phaser.WEBGL,
      backgroundColor: '#000000',
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [],
      plugins: {
        scene: [
          {
            key: 'rexUI',
            plugin: RexUIPlugin,
            mapping: 'rexUI'
          }
        ]
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: targetWidth,
        height: targetHeight
      },
      parent: 'gameContainer',
      dom: { createContainer: true },
      input: {
        mouse: { target: 'gameContainer' },
        touch: { target: 'gameContainer' },
      },
      physics: { default: 'arcade', arcade: {} },
      fps: { target: 30, forceSetTimeOut: true }
    };
  }

  public createGame(): void {
    this.phaserGame = new Phaser.Game(this.config);

    // Сцены
    this.phaserGame.scene.add('PreloaderScene', PreloaderScene, false);
    this.phaserGame.scene.add('MainMenuScene', MainMenuScene, false);
    this.phaserGame.scene.add('CreateLobbyScene', CreateLobbyScene, false);
    this.phaserGame.scene.add('LobbyScene', LobbyScene, false);
    this.phaserGame.scene.add('MultiplayerScene', MultiplayerScene, false);
    this.phaserGame.scene.add('SpaceBackgroundScene', SpaceBackgroundScene, false);
    this.phaserGame.scene.add('JoinLobbyScene', JoinLobbyScene, false);
    this.phaserGame.scene.add('SettingsScene', SettingsScene, false);
    this.phaserGame.scene.add('GameOverScene', GameOverScene, false);
    this.phaserGame.scene.add('KnightsGameScene', KnightsGameScene, false);
    this.phaserGame.scene.add('UIOverlayScene', UIOverlayScene, false);

    // Сохраняем Angular-сервисы и сторы в глобальный реестр
    this.phaserGame.registry.set('signalR', this._signalRService);
    this.phaserGame.registry.set('musicService', this._phaserMusicService);
    this.phaserGame.registry.set('playerSettingsStore', this._playerSettingsStore);
    this.phaserGame.registry.set('multiplayerStore', this._multiplayerStore);
    this.phaserGame.registry.set('joinLobbyStore', this._joinLobbyStore);
    this.phaserGame.registry.set('createLobbyStore', this._createLobbyStore);
    this.phaserGame.registry.set('lobbyStore', this._lobbyStore);

    this.phaserGame.scene.start('PreloaderScene');
  }
}
