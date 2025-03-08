import * as Phaser from 'phaser';

export class MultiplayerScene extends Phaser.Scene {
  private isHost!: boolean;
  private roomId!: string;

  constructor() {
    super({ key: 'MultiplayerScene' });
  }

  init(data: { isHost: boolean; roomId?: string }) {
    this.isHost = data.isHost;
    this.roomId = data.roomId || '';
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2, this.isHost ? 'Ожидание игроков...' : `Подключение к: ${this.roomId}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    setTimeout(() => {
      this.scene.start('main');//TODO Temp
    }, 3000);
  }
}
