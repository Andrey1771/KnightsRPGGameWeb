import * as Phaser from 'phaser';
import { SignalRService } from "../../services/signal-r-service/signal-r-service";
import { PhaserInputText } from '../../phaser-ui/phaser-input-text';
import { LocalStorageService } from "ngx-webstorage";
import { PlayerInfoResponseDto } from "../../dto/player-info-response-dto";

export class CreateLobbyScene extends Phaser.Scene {
  private inputField!: PhaserInputText;
  private createButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;

  private playerListTexts: Phaser.GameObjects.Text[] = [];
  private currentLobbyName = '';

  private _signalRService!: SignalRService;
  private _storage!: LocalStorageService;

  constructor(signalRService: SignalRService, storage: LocalStorageService) {
    super({ key: 'CreateLobbyScene' });
    this._signalRService = signalRService;
    this._storage = storage;
  }

  create() {
    this.scene.launch('UIOverlayScene', { showName: true, readOnly: true });

    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a1a');

    this.add.text(width / 2, height / 8, 'Создание лобби', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.inputField = new PhaserInputText(this, width / 2, height / 4, 'Введите название лобби');

    this.createButton = this.createButtonElement(width / 2, height * 0.6, 'Создать лобби', async () => {
      await this.createLobby();
    });

    this.backButton = this.createButtonElement(width / 2, height * 0.7, 'Назад в меню', () => {
      this.inputField.destroy();
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

  async createLobby() {
    const lobbyName = this.inputField.getValue();

    if (!lobbyName) {
      alert('Введите название лобби');
      return;
    }

    console.log(`Создание лобби с названием: ${lobbyName}`);
    this.currentLobbyName = lobbyName;
    await this.createRoom(lobbyName, 4 /* заглушка */);
  }

  setLobbyScene(lobbyName: string) {
    this.inputField.destroy();
    this.scene.start('LobbyScene', { lobbyName });
  }

  async createRoom(roomName: string, maxPlayers: number) {
    await this._signalRService.startConnection();

    this._signalRService.connection.on("RoomCreated", (roomName: string) => {
      this.setLobbyScene(roomName);
    });

    await this._signalRService.connection.invoke("CreateRoom", roomName, this._storage.retrieve("playerName"), maxPlayers);
  }

  updatePlayerList(players: string[]) {
    this.playerListTexts.forEach(text => text.destroy());
    this.playerListTexts = [];

    const startX = this.scale.width / 2;
    const startY = this.scale.height * 0.35;

    this.add.text(startX, startY - 40, 'Игроки в лобби:', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

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
