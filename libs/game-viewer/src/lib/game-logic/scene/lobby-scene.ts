import * as Phaser from 'phaser';
import { SignalRService } from "../../services/signal-r-service/signal-r-service";

interface PlayerInfoResponseDto {
  connectionIds: string[],
  leaderConnectionId: string
}

export class LobbyScene extends Phaser.Scene {
  private lobbyNameText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private lobbyName = '';
  private playerListTexts: Phaser.GameObjects.Text[] = [];
  private _signalRService!: SignalRService;

  private backButton!: Phaser.GameObjects.Text;

  private currentPlayerName = ''; // Имя текущего игрока

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

    const startX = this.scale.width / 2;
    const startY = this.scale.height * 0.3;

    this.add.text(startX, startY - 40, 'Игроки:', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.backButton = this.createButtonElement(width / 2, height * 0.8, 'Назад в меню', () => {
      this.backButton.destroy();
      this.scene.start('MainMenuScene');
    });

    // Обработчик старта игры
    this._signalRService.connection.on("GameStarted", (initialPositions, bots) => {
      console.log('Игра началась!');
      this.scene.start('MultiplayerScene', { initialPositions, bots });
    });

    // Кнопка "Начать игру" создается, но показывается только у лидера
    this.startButton = this.createButtonElement(width / 2, height * 0.7, 'Начать игру', () => {
      this._signalRService.connection.invoke("StartGame", this.lobbyName)
        .catch(err => console.error("Ошибка запуска игры:", err));
    });
    this.startButton.setVisible(false); // по умолчанию скрыта

    // Обновление списка игроков
    this._signalRService.connection.on("ReceivePlayerList", (dto: PlayerInfoResponseDto) => {
      this.updatePlayerList(dto.connectionIds, dto.leaderConnectionId);
      this.updateLeaderUI(dto.leaderConnectionId);
    });

    // Запрашиваем список игроков
    this._signalRService.connection.invoke("UpdatePlayerList", this.lobbyName)
      .catch(err => console.error("Ошибка запроса списка игроков:", err));
  }

  updatePlayerList(connectionIds: string[], leaderConnectionId: string) {
    // Удаляем старые элементы
    this.playerListTexts.forEach(text => text.destroy());
    this.playerListTexts = [];

    const startX = this.scale.width / 2;
    const startY = this.scale.height * 0.3;

    connectionIds.forEach((connectionId, index) => {
      const isLeader = connectionId === leaderConnectionId;
      const color = isLeader ? '#ffcc00' : '#00ff00';
      const leaderIcon = isLeader ? ' 🔰' : '';

      // Текст игрока
      const y = startY + index * 40;
      const playerText = this.add.text(
        startX,
        y,
        `${connectionId}${leaderIcon}`,
        {
          fontSize: '24px',
          fontFamily: 'Arial',
          color
        }
      ).setOrigin(0.5);

      this.playerListTexts.push(playerText);

      // Если текущий игрок — лидер, добавляем кнопку "Сделать лидером" для других игроков
      if (this._signalRService.connectionId === leaderConnectionId && !isLeader) {
        const makeLeaderButton = this.add.text(startX + 200, y, 'Сделать лидером', {
          fontSize: '20px',
          fontFamily: 'Arial',
          color: '#ffffff',
          backgroundColor: '#444444',
          padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        makeLeaderButton.on('pointerover', () => makeLeaderButton.setStyle({ backgroundColor: '#666666' }));
        makeLeaderButton.on('pointerout', () => makeLeaderButton.setStyle({ backgroundColor: '#444444' }));
        makeLeaderButton.on('pointerdown', () => {
          this._signalRService.connection.invoke("ChangeLeader", this.lobbyName, connectionId)
            .catch(err => console.error("Ошибка смены лидера:", err));
        });

        this.playerListTexts.push(makeLeaderButton);
      }
    });
  }

  private updateLeaderUI(leaderConnectionId: string) {
    if (this._signalRService.connectionId === leaderConnectionId) {
      this.startButton.setVisible(true);
    } else {
      this.startButton.setVisible(false);
    }
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
}
