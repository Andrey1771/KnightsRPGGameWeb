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
  private _initialBotPositions!: PositionMap;

  private _bots: Map<string, Phaser.GameObjects.Sprite> = new Map();

  private _signalRService!: SignalRService;

  private _bullets: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  constructor(signalRService: SignalRService) {
    super({ key: 'MultiplayerScene' });
    this._signalRService = signalRService;
  }

  init(data: { initialPositions: PositionMap, bots: PositionMap }) {
    this._initialPositions = data.initialPositions;
    this._initialBotPositions = data.bots;
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

    // Инициализация ботов
    Object.entries(this._initialBotPositions).forEach(([botId, pos]) => {
      const botSprite = this.add.sprite(pos.x, pos.y, 'bot');
      this._bots.set(botId, botSprite);
    });


    this._signalRService.connection.on("ReceiveBotList", (bots: { [botId: string]: { x: number, y: number } }) => {
      Object.entries(bots).forEach(([botId, pos]) => {
        this.scene.get('MultiplayerScene')?.events.emit('spawn-bot', botId, pos);
      });
    });

    this.events.on('spawn-bot', (botId: string, pos: { x: number, y: number }) => {
      const botSprite = this.add.sprite(pos.x, pos.y, 'bot'); // 'bot' должен быть загружен как текстура
      this._bots.set(botId, botSprite);
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

    this._signalRService.connection.on("ReceiveShot", (connectionId: string, startPosition: { x: number, y: number }) => {
      const bullet = this.add.circle(startPosition.x, startPosition.y, 4, 0xffff00);
      this.physics.add.existing(bullet);

      const speed = 400;
      (bullet.body as Phaser.Physics.Arcade.Body).setVelocity(0, -speed);

      // Удаляем пулю через 2 секунды
      this.time.delayedCall(2000, () => bullet.destroy());
    });

    this._signalRService.connection.on("ReceiveHit", () => {
      this._playerSprite.setTint(0xff0000);
      this.time.delayedCall(500, () => this._playerSprite.clearTint());
    });

    this._signalRService.connection.on("ReceiveBotHit", (botId, health) => {
      const bot = this._bots.get(botId);
      if (bot) {
        //bot.setTint(0xff0000);
        // можно добавить UI над ботом, отображающий здоровье
      }
    });

    this._signalRService.connection.on("BotDied", (botId) => {
      const bot = this._bots.get(botId);
      if (bot) {
        bot.destroy();
        this._bots.delete(botId);
      }
    });

    this._signalRService.connection.on("BulletHit", (connectionId: string) => {
      const bullet = this._bullets.get(connectionId);
      if (bullet) {
        bullet.destroy();
        this._bullets.delete(connectionId);
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

    // Новая пуля
    this._signalRService.connection.on("SpawnBullet", (bullet) => {
      const sprite = this.add.rectangle(bullet.x, bullet.y, 5, 10, 0xffffff);
      this.physics.add.existing(sprite);
      this._bullets.set(bullet.id, sprite);
    });

    // Обновление позиции пули
    this._signalRService.connection.on("UpdateBullet", (bullet) => {
      const sprite = this._bullets.get(bullet.id);
      if (sprite) {
        sprite.setPosition(bullet.x, bullet.y);
      }
    });

    // Пуля должна исчезнуть
    this._signalRService.connection.on("RemoveBullet", (bulletId) => {
      const sprite = this._bullets.get(bulletId);
      if (sprite) {
        sprite.destroy();
        this._bullets.delete(bulletId);
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

    this.input.keyboard?.on('keydown-SPACE', () => {
      this._signalRService.connection.invoke("Shoot");
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
