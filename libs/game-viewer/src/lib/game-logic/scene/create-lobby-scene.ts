import * as Phaser from 'phaser';
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

export class CreateLobbyScene extends Phaser.Scene {
  private inputField!: HTMLInputElement;
  private createButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;

  private playerListTexts: Phaser.GameObjects.Text[] = []; // <--- Таблица игроков
  private connection!: HubConnection;
  private currentLobbyName: string = '';

  constructor() {
    super({ key: 'CreateLobbyScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a1a');

    this.add.text(width / 2, height / 8, 'Создание лобби', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.placeholder = 'Введите название лобби';
    this.inputField.style.position = 'absolute';
    this.inputField.style.top = `${height / 4}px`;
    this.inputField.style.left = `${width / 2 - 150}px`;
    this.inputField.style.padding = '10px';
    this.inputField.style.fontSize = '16px';
    document.body.appendChild(this.inputField);

    this.createButton = this.createButtonElement(width / 2, height * 0.6, 'Создать лобби', () => {
      this.createLobby();
    });

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
    this.currentLobbyName = lobbyName;
    this.createRoom(lobbyName, 4 /* заглушка */);
  }

  setLobbyScene(lobbyName: string) {
    document.body.removeChild(this.inputField);

    // Передаём connection вместе с названием лобби
    this.scene.start('LobbyScene', { lobbyName, connection: this.connection });
  }

  createRoom(roomName: string, maxPlayers: number) {
    this.connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7172/gamehub") // TODO заменить на реальный URL
      .build();

    this.connection.on("RoomCreated", (roomName: string) => {
      this.setLobbyScene(roomName);
    });

    this.connection.on("ReceivePlayerList", (players: string[]) => {
      console.log("Текущие игроки:", players);
      this.updatePlayerList(players);
    });

    this.connection.on("PlayerJoined", (connectionId: string) => {
      console.log("Новый игрок присоединился:", connectionId);
      this.connection.invoke("RequestPlayerList", this.currentLobbyName);
    });

    this.connection.on("PlayerLeft", (connectionId: string) => {
      console.log("Игрок покинул:", connectionId);
      this.connection.invoke("RequestPlayerList", this.currentLobbyName);
    });

    this.connection.start().then(() => {
      if (roomName.trim() === "") {
        alert("Room name cannot be empty!");
        return;
      }

      this.connection.invoke("CreateRoom", roomName, maxPlayers).then(() => {
        this.connection.invoke("RequestPlayerList", roomName).catch(err => {
          console.error(err.toString());
        });
      })
        .catch(err => {
          console.error(err.toString());
        });
    }).catch(err => {
      console.error(err.toString());
    });
  }

  // Обновляем список игроков
  updatePlayerList(players: string[]) {
    // Сначала удаляем старые тексты
    this.playerListTexts.forEach(text => text.destroy());
    this.playerListTexts = [];

    const startX = this.scale.width / 2;
    let startY = this.scale.height * 0.35;

    this.add.text(startX, startY - 40, 'Игроки в лобби:', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Создаём текст для каждого игрока
    players.forEach((player, index) => {
      const playerText = this.add.text(startX, startY + index * 30, `Игрок ${index + 1}: ${player}`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00ff00'
      }).setOrigin(0.5);

      this.playerListTexts.push(playerText);
    });
  }
}
