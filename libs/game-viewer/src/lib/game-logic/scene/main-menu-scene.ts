import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private inputField!: HTMLInputElement;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    this.load.image('menuBg', 'assets/sprites/background/menu_background.png');
  }

  create() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, 'menuBg').setDisplaySize(width, height);

    this.add.text(width / 2, height / 4, 'Knights Game', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

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
  }
}
