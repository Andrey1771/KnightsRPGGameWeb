import * as Phaser from 'phaser';

export class CreateGameScene extends Phaser.Scene {
  private players: string[] = [];
  private playersText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'CreateGameScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Фон
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Заголовок
    this.add.text(width / 2, height / 8, 'Лобби', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Таблица игроков
    this.playersText = this.add.text(width / 2, height / 4, '', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Кнопка "Старт игры"
    this.startButton = this.createButton(width / 2, height * 0.7, 'Старт игры', () => {
      this.startGame();
    });

    // Кнопка "Назад в меню"
    this.backButton = this.createButton(width / 2, height * 0.8, 'Назад в меню', () => {
      this.scene.start('MainMenuScene');
    });

    // Тестовые игроки (потом удалить)
    this.addPlayer('Игрок 1');
    this.addPlayer('Игрок 2');
  }

  createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Text {
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

  addPlayer(playerName: string) {
    this.players.push(playerName);
    this.updatePlayersList();
  }

  updatePlayersList() {
    this.playersText.setText(this.players.map((name, index) => `${index + 1}. ${name}`).join('\n'));
  }

  startGame() {
    console.log('Игра начинается...');
    this.scene.start('MultiplayerScene', { isHost: true });
  }
}
