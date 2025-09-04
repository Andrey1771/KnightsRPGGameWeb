import InputText from 'phaser3-rex-plugins/plugins/inputtext';
import { PhaserMusicService } from "../../services/phaser-music-service/phaser-music-service";
import { LocalStorageService } from "ngx-webstorage";
import { generateFunnyNick } from '../../utils/nick-generator';

interface UIOverlayData {
  showName?: boolean;
  readOnly?: boolean;
}

export class UIOverlayScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private _storage!: LocalStorageService;
  private playerNameInput?: InputText;

  constructor(phaserMusicService: PhaserMusicService, storage: LocalStorageService) {
    super({ key: 'UIOverlayScene', active: true });
    this._phaserMusicService = phaserMusicService;
    this._storage = storage;
  }

  create(data?: UIOverlayData) {
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
      const savedName = String(this._storage.retrieve('playerName') || '');

      this.playerNameInput = this.rexUI.add.inputText({
        x: 20,
        y: 60,
        width: 250,
        height: 40,
        type: 'text',
        text: savedName,
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        placeholder: 'Имя игрока',
        maxLength: 20,
        readOnly: !!data.readOnly, // можно ли редактировать
      }).setOrigin(0, 0.5);

      if (!data.readOnly) {
        this.playerNameInput.on('textchange', (input: InputText) => {
          this._storage.store('playerName', String(input.text));
        });

        // Кнопка генерации ника
        const padding = 10; // отступ между полем и кнопкой
        const generateButton = this.add.text(
          this.playerNameInput.x + this.playerNameInput.width + padding,
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
          const funnyNick = generateFunnyNick();
          this.playerNameInput.text = funnyNick;
          this._storage.store('playerName', String(funnyNick));
        });
      }
    }
  }
}
