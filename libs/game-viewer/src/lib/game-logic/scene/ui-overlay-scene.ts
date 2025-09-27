import * as Phaser from 'phaser';
import InputText from 'phaser3-rex-plugins/plugins/inputtext';
import { PhaserMusicService } from "../../services/phaser-music-service/phaser-music-service";
import { SignalRService } from "../../services/signal-r-service/signal-r-service";
import { Store } from '@ngrx/store';
import { selectPlayerName } from "../store/player-settings/player-settings.selectors";
import { generateRandomName, setPlayerName } from '../store/player-settings/player-settings.actions';
import {Subject, take, takeUntil} from "rxjs";
import {PlayerSettingsState} from "../store/player-settings/player-settings.reducer";
import {GameState} from "../store/game/game.state";
import {selectLobbyName} from "../store/lobby/lobby.selectors";

interface UIOverlayData {
  showName?: boolean;
  readOnly?: boolean;
  showPauseButton?: boolean;
}

export class UIOverlayScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private _playerSettingsStore!: Store<{ playerSettings: PlayerSettingsState }>;
  private _gameStateStore!: Store<GameState>;
  private _signalRService!: SignalRService;

  private playerNameInput?: InputText;
  private pauseButton?: Phaser.GameObjects.Text;

  private destroy$ = new Subject<void>();

  constructor() {
    super({ key: 'UIOverlayScene' });
  }

  create(data?: UIOverlayData) {
    // Берём сервисы из глобального реестра
    this._signalRService = this.registry.get('signalR');
    this._phaserMusicService = this.registry.get('musicService');
    this._playerSettingsStore = this.registry.get('playerSettingsStore');
    this._gameStateStore = this.registry.get('lobbyStore');//TODO Ошибка брать lobbyStore?

    const { width } = this.scale;

    // Музыка кнопка
    const isMusicMuted = this._phaserMusicService.getSettings().musicMuted;
    const musicButton = this.add.text(width - 140, 40, isMusicMuted ? 'Музыка: Выкл' : 'Музыка: Вкл', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    musicButton.on('pointerdown', () => {
      this._phaserMusicService.toggleMusic();
      const isMuted = this._phaserMusicService.getSettings().musicMuted;
      musicButton.setText(isMuted ? 'Музыка: Выкл' : 'Музыка: Вкл');
    });

    // Звуки кнопка
    const isSoundsMuted = this._phaserMusicService.getSettings().soundsMuted;
    const soundsButton = this.add.text(width - 140, 100, isSoundsMuted ? 'Звуки: Выкл' : 'Звуки: Вкл', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    soundsButton.on('pointerdown', () => {
      this._phaserMusicService.toggleSounds();
      const isMuted = this._phaserMusicService.getSettings().soundsMuted;
      soundsButton.setText(isMuted ? 'Звуки: Выкл' : 'Звуки: Вкл');
    });

    // TODO Полный экран
    const fullscreenButton = this.add.text(10, 10, '🖵 Fullscreen', {
      fontSize: '24px'
    }).setInteractive();

    fullscreenButton.on('pointerup', () => {
      if (!this.scale.isFullscreen) {
        this.scale.startFullscreen();
      } else {
        this.scale.stopFullscreen();
      }
    });

    // Поле имени (если включено)
    if (data?.showName) {
      this.playerNameInput = this.rexUI.add.inputText({
        x: 20,
        y: 60,
        width: 250,
        height: 40,
        type: 'text',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        placeholder: 'Имя игрока',
        maxLength: 20,
        readOnly: !!data.readOnly,
      }).setOrigin(0, 0.5);

      this._playerSettingsStore.select(selectPlayerName).pipe(takeUntil(this.destroy$)).subscribe((playerName) => {
        if (this.playerNameInput) {
          this.playerNameInput.text = playerName ?? '';
        }
      });

      if (!data.readOnly) {
        this.playerNameInput.on('textchange', (input: InputText) => {
          this._playerSettingsStore.dispatch(setPlayerName({ name: String(input.text) }));
        });

        // Кнопка генерации ника
        const generateButton = this.add.text(
          this.playerNameInput.x + this.playerNameInput.width + 10,
          this.playerNameInput.y,
          '🎲',
          {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
          }
        )
          .setOrigin(0, 0.5)
          .setInteractive();

        generateButton.on('pointerover', () => generateButton.setStyle({ backgroundColor: '#333333' }));
        generateButton.on('pointerout', () => generateButton.setStyle({ backgroundColor: '#000000' }));
        generateButton.on('pointerdown', () => {
          if (!this.playerNameInput) return;
          this._playerSettingsStore.dispatch(generateRandomName());
        });
      }
    }

    // Кнопка паузы под ником (если разрешено в data)
    if (data?.showPauseButton) {
      this.pauseButton = this.add.text(
        20,
        120,
        '⏸ Пауза',
        {
          fontSize: '24px',
          fontFamily: 'Arial',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 15, y: 8 },
        }
      )
        .setOrigin(0, 0.5)
        .setInteractive();

      this.pauseButton.on('pointerover', () =>
        this.pauseButton?.setStyle({ backgroundColor: '#333333' })
      );
      this.pauseButton.on('pointerout', () =>
        this.pauseButton?.setStyle({ backgroundColor: '#000000' })
      );
      this.pauseButton.on('pointerdown', async () => {
        this._gameStateStore.select(selectLobbyName).pipe(take(1)).pipe(takeUntil(this.destroy$)).subscribe(async (roomName) => {
          if (roomName === "") {
            console.warn("Нет названия комнаты в GameStateStore");
            return;
          }
          await this._signalRService.invokeSafe("TogglePause", roomName);
          }
        );///////////////TODO
      });
    }

    this.events.once('shutdown', this.shutDownListener, this);
  }

  shutDownListener() {
    this.destroy$.next(); // гасим все подписки текущего запуска
    this.destroy$ = new Subject<void>(); // создаём новый на следующий цикл жизни
    //this.destroy$.complete();
    console.log("ui overlay shutdown");
  }
}
