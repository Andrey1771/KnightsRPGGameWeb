import * as Phaser from 'phaser';
import {SignalRService} from "../../services/signal-r-service/signal-r-service";

export class LobbyScene extends Phaser.Scene {
  private lobbyNameText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private lobbyName = '';

  private playerListTexts: Phaser.GameObjects.Text[] = [];

  private _signalRService!: SignalRService;

  constructor(signalRService: SignalRService) {
    super({ key: 'LobbyScene' });
    this._signalRService = signalRService;
  }

  init(data: any) {
    this.lobbyName = data.lobbyName || 'Лобби';
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a1a');

    this.lobbyNameText = this.add.text(width / 2, height / 8, `Лобби: ${this.lobbyName}`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // При старте сцены подключаем обработчик начала игры
    this._signalRService.connection.on("GameStarted", (initialPositions, bots) => {
      console.log('Игра началась!');
      this.scene.start('MultiplayerScene', { initialPositions, bots });
    });

    // При нажатии кнопки "Начать игру"
    this.startButton = this.createButtonElement(width / 2, height * 0.8, 'Начать игру', () => {
      this._signalRService.connection.invoke("StartGame", this.lobbyName)
        .catch(err => console.error("Ошибка запуска игры:", err));
    });

    // Обработчик получения списка игроков
    this._signalRService.connection.on("ReceivePlayerList", (players: string[]) => {
      this.updatePlayerList(players);
    });

    // После загрузки сцены сразу запрашиваем список игроков
    this._signalRService.connection.invoke("UpdatePlayerList", this.lobbyName)
      .catch(err => console.error("Ошибка запроса списка игроков:", err));



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

  updatePlayerList(players: string[]) {
    // Удаляем старые элементы
    this.playerListTexts.forEach(text => text.destroy());
    this.playerListTexts = [];

    const startX = this.scale.width / 2;
    const startY = this.scale.height * 0.3;

    this.add.text(startX, startY - 40, 'Игроки:', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Выводим список игроков
    players.forEach((player, index) => {
      const playerText = this.add.text(startX, startY + index * 30, `Игрок ${index + 1}: ${player}`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00ff00'
      }).setOrigin(0.5);

      this.playerListTexts.push(playerText);
    });
  }

  startGame() {
    console.log(`Игра начинается в лобби: ${this.lobbyName}`);
    this.scene.start('MultiplayerScene', { isHost: true });
  }
}
