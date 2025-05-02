import * as Phaser from 'phaser';
import { HubConnection } from '@microsoft/signalr';
import {SignalRService} from "../../services/signal-r-service/signal-r-service";

enum PlayerInputAction {
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  StopMoveUp = 'StopMoveUp',
  StopMoveDown = 'StopMoveDown',
  StopMoveLeft = 'StopMoveLeft',
  StopMoveRight = 'StopMoveRight'
}

interface PlayerPositionDto {
  x: number;
  y: number;
}

type PositionMap = Record<string, PlayerPositionDto>;

export class MultiplayerScene extends Phaser.Scene {
  private _background!: Phaser.GameObjects.Image;
  private _playerSprite!: Phaser.GameObjects.Sprite;
  private _remotePlayers: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private _connectionId = '';
  private _cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private _initialPositions!: PositionMap;

  private _signalRService!: SignalRService;

  constructor(signalRService: SignalRService) {
    super({ key: 'MultiplayerScene' });
    this._signalRService = signalRService;
  }

  init(data: { initialPositions: PositionMap }) {
    this._initialPositions = data.initialPositions;
  }

  preload() {
    this.load.spritesheet('ball', 'assets/sprites/player/ball.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('background', 'assets/sprites/background/background.png');
  }

  async create() {
    const { width, height } = this.scale;
    this._background = this.add.image(width / 2, height / 2, 'background');
    this._background.setDisplaySize(width, height);

    this._cursors = this.input.keyboard!.createCursorKeys();

    // Создаем спрайт локального игрока
    this._playerSprite = this.add.sprite(width / 2, height / 2, 'ball');

    this._connectionId = await this._signalRService.connection.invoke("GetConnectionId");


    Object.entries(this._initialPositions).forEach(([connectionId, pos]) => {
      if (connectionId === this._connectionId) {
        // Устанавливаем позицию нашего игрока
        this._playerSprite.setPosition(pos.x, pos.y);
      } else {
        // Добавляем других игроков
        const remote = this.add.sprite(pos.x, pos.y, 'ball').setTint(0x00ff00);
        this._remotePlayers.set(connectionId, remote);
      }
    });


    // Получение обновлений от сервера
    this._signalRService.connection.on("ReceivePlayerPosition", (connectionId: string, position: { x: number, y: number }) => {
      if (connectionId === this._connectionId) {
        this._playerSprite.setPosition(position.x, position.y);
        return;
      }

      let remoteSprite = this._remotePlayers.get(connectionId);
      if (!remoteSprite) {
        remoteSprite = this.add.sprite(position.x, position.y, 'ball').setTint(0x00ff00); // Зеленый для других
        this._remotePlayers.set(connectionId, remoteSprite);
      } else {
        remoteSprite.setPosition(position.x, position.y);
      }
    });

    // Удаление игрока при выходе
    this._signalRService.connection.on("PlayerLeft", (connectionId: string) => {
      const sprite = this._remotePlayers.get(connectionId);
      if (sprite) {
        sprite.destroy();
        this._remotePlayers.delete(connectionId);
      }
    });
  }

  override update() {
    if (!this._cursors || !this._signalRService.connection || this._signalRService.connection.state !== "Connected") return;

    const keysDown = new Set<string>();

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (keysDown.has(event.code)) return; // уже нажата — игнорируем
      keysDown.add(event.code);

      switch (event.code) {
        case 'ArrowUp':
          this._signalRService.connection.invoke("PerformAction", PlayerInputAction.MoveUp);
          break;
        case 'ArrowDown':
          this._signalRService.connection.invoke("PerformAction", PlayerInputAction.MoveDown);
          break;
        case 'ArrowLeft':
          this._signalRService.connection.invoke("PerformAction", PlayerInputAction.MoveLeft);
          break;
        case 'ArrowRight':
          this._signalRService.connection.invoke("PerformAction", PlayerInputAction.MoveRight);
          break;
      }
    });

    this.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
      if (!keysDown.has(event.code)) return;
      keysDown.delete(event.code);

      switch (event.code) {
        case 'ArrowUp':
          this._signalRService.connection.invoke("PerformAction", PlayerInputAction.StopMoveUp);
          break;
        case 'ArrowDown':
          this._signalRService.connection.invoke("PerformAction", PlayerInputAction.StopMoveDown);
          break;
        case 'ArrowLeft':
          this._signalRService.connection.invoke("PerformAction", PlayerInputAction.StopMoveLeft);
          break;
        case 'ArrowRight':
          this._signalRService.connection.invoke("PerformAction", PlayerInputAction.StopMoveRight);
          break;
      }
    });


  }
}
