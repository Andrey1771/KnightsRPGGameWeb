import * as Phaser from 'phaser';
import {HubConnectionBuilder} from "@microsoft/signalr";

export class CreateLobbyScene extends Phaser.Scene {
  private inputField!: HTMLInputElement;
  private createButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'CreateLobbyScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Фон
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Заголовок
    this.add.text(width / 2, height / 8, 'Создание лобби', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Ввод имени лобби
    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.placeholder = 'Введите название лобби';
    this.inputField.style.position = 'absolute';
    this.inputField.style.top = `${height / 4}px`;
    this.inputField.style.left = `${width / 2 - 150}px`;
    this.inputField.style.padding = '10px';
    this.inputField.style.fontSize = '16px';
    document.body.appendChild(this.inputField);

    // Кнопка "Создать лобби"
    this.createButton = this.createButtonElement(width / 2, height * 0.6, 'Создать лобби', () => {
      this.createLobby();
    });

    // Кнопка "Назад в меню"
    this.backButton = this.createButtonElement(width / 2, height * 0.7, 'Назад в меню', () => {
      this.scene.start('MainMenuScene');
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

  createLobby() {
    const lobbyName = this.inputField.value.trim();

    if (!lobbyName) {
      alert('Введите название лобби');
      return;
    }


    console.log(`Создание лобби с названием: ${lobbyName}`);
    this.createRoom(lobbyName, 4/*Заглушка*/);

  }

  setLobbyScene(lobbyName: string) {
    // Удаляем inputField после создания лобби
    document.body.removeChild(this.inputField);

    // Переходим в сцену лобби с названием
    this.scene.start('LobbyScene', { lobbyName });
  }

  /*TODO Вынести в сервис*/
  createRoom(roomName: string, maxPlayers: number) {
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7172/gamehub") //TODO
      .build();

    // Обработчик для успешного создания комнаты

    connection.on("RoomCreated", (roomName: string) => {
      this.setLobbyScene(roomName);
    });

    connection.start().then(() => {
      if (roomName.trim() === "") {
        alert("Room name cannot be empty!");
        return;
      }

      // Вызов метода CreateRoom в SignalR
      connection.invoke("CreateRoom", roomName, maxPlayers)
        .catch(function(err) {
          return console.error(err.toString());
        });
    }).catch(function (err) {
      return console.error(err.toString());
    });
  }
}
