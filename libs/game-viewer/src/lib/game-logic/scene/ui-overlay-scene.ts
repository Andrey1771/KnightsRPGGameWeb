import { PhaserMusicService } from "../../services/phaser-music-service/phaser-music-service";

export class UIOverlayScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;

  constructor(phaserMusicService: PhaserMusicService) {
    super({ key: 'UIOverlayScene', active: true });
    this._phaserMusicService = phaserMusicService;
  }

  create() {
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
      const isMusicMuted = this._phaserMusicService.getSettings().musicMuted;
      musicButton.setText(isMusicMuted ? 'Музыка: Выкл' : 'Музыка: Вкл');
    });

    // Звуки кнопка
    const isSoundsMuted = this._phaserMusicService.getSettings().soundsMuted;
    const soundsButton = this.add.text(width - 140, 100, isSoundsMuted ?  'Звуки: Выкл' : 'Звуки: Вкл', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    soundsButton.on('pointerdown', () => {
      this._phaserMusicService.toggleSounds();
      const isSoundsMuted = this._phaserMusicService.getSettings().soundsMuted;
      soundsButton.setText(isSoundsMuted ?  'Звуки: Выкл' : 'Звуки: Вкл');
    });

    //TODO Полный экран
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
  }
}
