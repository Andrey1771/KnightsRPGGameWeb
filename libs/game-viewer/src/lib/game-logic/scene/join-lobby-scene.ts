import * as Phaser from 'phaser';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

export class JoinLobbyScene extends Phaser.Scene {
  private inputField!: HTMLInputElement;
  private joinButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;

  private connection!: HubConnection;

  constructor() {
    super({ key: 'JoinLobbyScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a1a');

    this.add.text(width / 2, height / 8, 'Присоединиться к лобби', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.placeholder = 'Введите название лобби';
    this.inputField.style.position = 'absolute';
    this.inputField.style.top = `${height / 3}px`;
    this.inputField.style.left = `${width / 2 - 150}px`;
    this.inputField.style.padding = '10px';
    this.inputField.style.fontSize = '16px';
    document.body.appendChild(this.inputField);

    this.joinButton = this.createButtonElement(width / 2, height * 0.6, 'Присоединиться', () => {
      this.joinLobby();
    });

    this.backButton = this.createButtonElement(width / 2, height * 0.7, 'Назад в меню', () => {
      document.body.removeChild(this.inputField);
      this.scene.start('MainMenuScene');
    });

    // Создаём соединение заранее
    this.connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7172/gamehub") //TODO URL
      .build();
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

  joinLobby() {
    const lobbyName = this.inputField.value.trim();
    if (!lobbyName) {
      alert('Введите название лобби');
      return;
    }

    console.log(`Присоединение к лобби: ${lobbyName}`);

    this.connection.start().then(() => {
      this.connection.invoke("JoinRoom", lobbyName)
        .then(() => {
          document.body.removeChild(this.inputField);
          this.scene.start('LobbyScene', { lobbyName, connection: this.connection });
        })
        .catch((err) => {
          console.error(err.toString());
          alert('Ошибка подключения к лобби.');
        });
    }).catch(err => {
      console.error('Ошибка соединения с сервером:', err);
      alert('Не удалось подключиться к серверу.');
    });
  }
}
