import * as Phaser from 'phaser';
import { SignalRService } from "../../services/signal-r-service/signal-r-service";
import { PhaserInputText } from '../../phaser-ui/phaser-input-text';

export class JoinLobbyScene extends Phaser.Scene {
  private inputText!: Phaser.GameObjects.Text;
  private lobbyName = '';

  private joinButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;

  private _signalRService!: SignalRService;

  private inputField!: PhaserInputText;

  constructor(signalRService: SignalRService) {
    super({ key: 'JoinLobbyScene' });
    this._signalRService = signalRService;
  }

  async create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a1a');

    this.inputField = new PhaserInputText(this, width / 2, height / 3, 'Введите название лобби');

    this.createButtonElement(width / 2, height * 0.6, 'Присоединиться', async () => {
      const lobbyName = this.inputField.getValue();
      if (!lobbyName) {
        alert('Введите название лобби');
        return;
      }

      await this._signalRService.connection.invoke("JoinRoom", lobbyName);
    });

    this.createButtonElement(width / 2, height * 0.7, 'Назад в меню', () => {
      this.inputField.destroy();
      this.scene.start('MainMenuScene');
    });

    await this._signalRService.startConnection();

    this._signalRService.connection.on("Error", (errorMessage: string) => {
      alert(`Ошибка: ${errorMessage}`);
    });

    this._signalRService.connection.on("PlayerJoined", (playerId: string) => {
      const lobbyName = this.inputField.getValue();
      this.scene.start('LobbyScene', { lobbyName });
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

  async joinLobby() {
    const lobbyName = this.lobbyName.trim();
    if (!lobbyName) {
      console.warn('Введите название лобби');
      return;
    }

    console.log(`Присоединение к лобби: ${lobbyName}`);
    await this._signalRService.connection.invoke("JoinRoom", lobbyName);
    this.scene.start('LobbyScene', { lobbyName });
  }
}
