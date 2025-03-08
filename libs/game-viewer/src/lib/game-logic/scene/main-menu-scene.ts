import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private inputField!: HTMLInputElement;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    this.load.image('menuBg', 'assets/sprites/background/menu_background.png'); // Фон меню
  }

  create() {
    const { width, height } = this.scale;

    // Фон
    this.add.image(width / 2, height / 2, 'menuBg').setDisplaySize(width, height);

    // Заголовок
    this.add.text(width / 2, height / 4, 'Knights Game', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопки
    this.createButton(width / 2, height / 2 - 50, 'Начать игру', () => {
      this.scene.start('main');
    });

    this.createButton(width / 2, height / 2 + 10, 'Создать игру', () => {
      this.startMultiplayer(true);
    });

    this.createButton(width / 2, height / 2 + 70, 'Присоединиться', () => {
      this.showJoinGameUI();
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

  startMultiplayer(isHost: boolean) {
    console.log(isHost ? 'Создание игры...' : 'Присоединение...');
    this.scene.start('MultiplayerScene', { isHost });
  }

  showJoinGameUI() { //TODO Подправить или вынести
    if (!this.inputField) {
      this.inputField = document.createElement('input');
      this.inputField.type = 'text';
      this.inputField.placeholder = 'Введите ID комнаты';
      this.inputField.style.position = 'absolute';
      this.inputField.style.top = '50%';
      this.inputField.style.left = '50%';
      this.inputField.style.transform = 'translate(-50%, -50%)';
      this.inputField.style.padding = '10px';
      document.body.appendChild(this.inputField);

      this.inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.joinGame(this.inputField.value);
        }
      });
    }
  }

  joinGame(roomId: string) {
    console.log(`Присоединение к комнате: ${roomId}`);
    this.scene.start('MultiplayerScene', { isHost: false, roomId });
    document.body.removeChild(this.inputField);
  }
}
