import * as Phaser from 'phaser';
import {SignalRService} from "../../services/signal-r-service/signal-r-service";

export class GameOverScene extends Phaser.Scene {
  private score!: number;

  private _signalRService!: SignalRService;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create() {
    this._signalRService =  this.registry.get('signalR');

    const { width, height } = this.scale;

// Полупрозрачный фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);

// Панель Game Over
    const panel = this.add.rectangle(width / 2, height / 2, 400, 200, 0x222222, 0.9)
      .setStrokeStyle(2, 0xffffff);

    const gameOverText = this.add.text(width / 2, height / 2 - 60,
      `Game Over\nВаш счёт: ${this.score.toFixed(0)}`, {
        font: '24px Arial',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

    const button = this.add.text(width / 2, height / 2 + 30, 'Вернуться в меню', {
      font: '20px Arial',
      color: '#ffffff',
      backgroundColor: '#444444',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#666666' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#444444' }));
    button.on('pointerdown', async () => {
      await this._signalRService.stopConnection();
      this.events.removeAllListeners();
      this.scene.stop('GameOverScene');
      this.scene.stop('MultiplayerScene');
      this.scene.stop('SpaceBackgroundScene');
      this.scene.stop('UIOverlayScene');
      this.scene.start('MainMenuScene');
    });
  }
}
