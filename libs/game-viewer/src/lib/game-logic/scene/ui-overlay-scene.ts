import { PhaserMusicService } from "../../services/phaser-music-service/phaser-music-service";

export class UIOverlayScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;

  private musicEnabled = true;
  private soundsEnabled = true;

  constructor(phaserMusicService: PhaserMusicService) {
    super({ key: 'UIOverlayScene', active: true });
    this._phaserMusicService = phaserMusicService;
  }

  create() {
    const { width } = this.scale;

    // Музыка кнопка
    const musicButton = this.add.text(width - 140, 40, 'Музыка: Вкл', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    musicButton.on('pointerdown', () => {
      this.musicEnabled = !this.musicEnabled;
      musicButton.setText(this.musicEnabled ? 'Музыка: Вкл' : 'Музыка: Выкл');
      this._phaserMusicService.toggleMusic(this.musicEnabled);
    });

    // Звуки кнопка
    const soundsButton = this.add.text(width - 140, 100, 'Звуки: Вкл', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    soundsButton.on('pointerdown', () => {
      this.soundsEnabled = !this.soundsEnabled;
      soundsButton.setText(this.soundsEnabled ? 'Звуки: Вкл' : 'Звуки: Выкл');
      this._phaserMusicService.toggleSounds(this.soundsEnabled);
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

    this.scene.bringToTop()
  }
}
