import * as Phaser from 'phaser';

export class LobbyScene extends Phaser.Scene {
  private lobbyNameText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private lobbyName = '';


  constructor() {
    super({ key: 'LobbyScene' });
  }

  init(data: any) {
    this.lobbyName = data.lobbyName || 'Лобби';
  }

  create() {
    const { width, height } = this.scale;

    // Фон
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Заголовок с названием лобби
    this.lobbyNameText = this.add.text(width / 2, height / 4, `Лобби: ${this.lobbyName}`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопка "Начать игру"
    this.startButton = this.createButtonElement(width / 2, height * 0.6, 'Начать игру', () => {
      this.startGame();
    });
  }

  createButtonElement(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, text, {
      fontSize: '36px',
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

  startGame() {
    console.log(`Игра начинается в лобби: ${this.lobbyName}`);
    this.scene.start('MultiplayerScene', { isHost: true });
  }
}
