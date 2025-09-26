import { MusicTrack, PhaserMusicService } from '../../services/phaser-music-service/phaser-music-service';
import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private playerNameInput!: any; // rexUI InputText

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    this._phaserMusicService = this.registry.get('musicService') as PhaserMusicService;

    this.scene.launch('UIOverlayScene', { showPauseButton: false, showName: true, readOnly: false });

    this._phaserMusicService.init(this);
    this._phaserMusicService.playMusic(MusicTrack.MainTheme);

    const { width, height } = this.scale;
    const canvas = this.sys.game.canvas;

    // Фон
    this.add.image(canvas.width / 2, canvas.height / 2, 'menuBg')
      .setDisplaySize(canvas.width, canvas.height)
      .setScrollFactor(0)
      .setDepth(-1);

    // Заголовок
    this.add.text(width / 2, height * 0.15, 'Knights Game', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопки меню (по центру, вертикально)
    const buttonSpacing = 80;
    const startY = height * 0.4;
    const centerX = width / 2;

    this.createButton(centerX, startY, 'Начать игру', () => {
      this.scene.start('main');
    });

    this.createButton(centerX, startY + buttonSpacing, 'Создать игру', () =>
      this.scene.start('CreateLobbyScene')
    );
    this.createButton(centerX, startY + buttonSpacing * 2, 'Присоединиться', () =>
      this.scene.start('JoinLobbyScene')
    );
    this.createButton(centerX, startY + buttonSpacing * 3, 'Настройки', () =>
      this.scene.start('SettingsScene')
    );
  }

  createButton(x: number, y: number, text: string, callback: () => void) {
    const button = this.add.text(x, y, text, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#333333' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#000000' }));
    button.on('pointerdown', callback);

    return button;
  }
}
