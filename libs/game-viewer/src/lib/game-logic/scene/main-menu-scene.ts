import * as Phaser from 'phaser';
import {MusicTrack, PhaserMusicService} from "../../services/phaser-music-service/phaser-music-service";

export class MainMenuScene extends Phaser.Scene {
  private inputField!: HTMLInputElement;
  private _phaserMusicService!: PhaserMusicService;

  constructor(phaserMusicService: PhaserMusicService) {
    super({ key: 'MainMenuScene' });
    this._phaserMusicService = phaserMusicService;
  }

  create() {
    this._phaserMusicService.init(this);
    this._phaserMusicService.playMusic(MusicTrack.MainTheme);

    const { width, height } = this.scale;
    const canvas = this.sys.game.canvas;
    const realWidth = canvas.width;
    const realHeight = canvas.height;

    // Центр фона по центру canvas
    this.add.image(realWidth / 2, realHeight / 2, 'menuBg')
      .setDisplaySize(realWidth, realHeight)
      .setScrollFactor(0)
      .setDepth(-1);

    // Всё остальное — позиционируй по обычному игровому "виртуальному" размеру
    this.add.text(width / 2, height / 4, 'Knights Game', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // кнопки
    this.createButton(width / 2, height / 2 - 50, 'Начать игру', () => {
      this.scene.start('main');
    });

    this.createButton(width / 2, height / 2 + 10, 'Создать игру', () => {
      this.scene.start('CreateLobbyScene');
    });

    this.createButton(width / 2, height / 2 + 70, 'Присоединиться', () => {
      this.scene.start('JoinLobbyScene');
    });

    this.createButton(width / 2, height / 2 + 130, 'Настройки', () => {
      this.scene.start('SettingsScene');
    });
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
