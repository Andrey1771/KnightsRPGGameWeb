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

//TODO State
interface PlayerPositionDto {
  x: number;
  y: number;
  health: number; // ← добавлено
}

enum BulletType
{
  Straight,
  ZigZag,
  Arc,
  Explosive
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
  private _enemyBullets: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  private _playerHealthText!: Phaser.GameObjects.Text;
  private _healthTexts: Map<string, Phaser.GameObjects.Text> = new Map();

  private _scoreText!: Phaser.GameObjects.Text;
  private fpsText: any;

  constructor(signalRService: SignalRService) {
    super({ key: 'MultiplayerScene' });
    this._signalRService = signalRService;
  }

  init(data: { initialPositions: PositionMap, bots: PositionMap }) {
    this._initialPositions = data.initialPositions;
    this._initialBotPositions = data.bots;
  }

  preload() {
    this.load.spritesheet('player', 'assets/sprites/player/player_0.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('enemy_0', 'assets/sprites/enemies/enemy_0.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('enemy_1', 'assets/sprites/enemies/enemy_1.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('ball', 'assets/sprites/player/ball.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('background', 'assets/sprites/background/background.png');

  }

  async create() {
    this._initializeScene();
    this._setupControls();
    this._setupUI();

    await this._registerPlayer();

    this._spawnInitialPlayers();
    this._spawnInitialBots();

    this._setupSignalRHandlers();
  }

  private _initializeScene() {
    const { width, height } = this.scale;
    this._background = this.add.image(width / 2, height / 2, 'background');
    this._background.setDisplaySize(width, height);
  }

  private _setupControls() {
    this._cursors = this.input.keyboard!.createCursorKeys();
    const keysDown = new Set<string>();

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (keysDown.has(event.code)) return;
      keysDown.add(event.code);

      switch (event.code) {
        case 'ArrowUp': this._sendAction(PlayerInputAction.MoveUp); break;
        case 'ArrowDown': this._sendAction(PlayerInputAction.MoveDown); break;
        case 'ArrowLeft': this._sendAction(PlayerInputAction.MoveLeft); break;
        case 'ArrowRight': this._sendAction(PlayerInputAction.MoveRight); break;
      }
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this._signalRService.connection.invoke("Shoot");
    });

    this.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
      if (!keysDown.has(event.code)) return;
      keysDown.delete(event.code);

      switch (event.code) {
        case 'ArrowUp': this._sendAction(PlayerInputAction.StopMoveUp); break;
        case 'ArrowDown': this._sendAction(PlayerInputAction.StopMoveDown); break;
        case 'ArrowLeft': this._sendAction(PlayerInputAction.StopMoveLeft); break;
        case 'ArrowRight': this._sendAction(PlayerInputAction.StopMoveRight); break;
      }
    });
  }

  private _sendAction(action: PlayerInputAction) {
    this._signalRService.connection.invoke("PerformAction", action);
  }

  private _setupUI() {
    this._playerSprite = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'player').setScale(0.25);

    this._playerHealthText = this.add.text(16, 16, 'HP: 100', {
      font: '20px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 6, y: 4 },
    }).setScrollFactor(0);

    this._scoreText = this.add.text(this.scale.width - 150, 16, 'Score: 0', {
      font: '20px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 6, y: 4 },
    }).setScrollFactor(0).setOrigin(1, 0);

    this.fpsText = this.add.text(10, 10, '', { font: '16px Courier' });
  }

  private async _registerPlayer() {
    this._connectionId = await this._signalRService.connection.invoke("GetConnectionId");
  }

  private _spawnInitialPlayers() {
    Object.entries(this._initialPositions).forEach(([id, pos]) => {
      if (id === this._connectionId) {
        this._playerSprite.setPosition(pos.x, pos.y);
      } else {
        const remote = this.add.sprite(pos.x, pos.y, 'player').setScale(0.25).setTint(0x00ff00);
        this._remotePlayers.set(id, remote);
      }
    });
  }

  private _spawnInitialBots() {
    Object.entries(this._initialBotPositions).forEach(([botId, pos]) => {
      const botSprite = this.add.sprite(pos.x, pos.y, 'bot');
      this._bots.set(botId, botSprite);
    });
  }

  private _setupSignalRHandlers() {
    const on = this._signalRService.connection.on.bind(this._signalRService.connection);

    on("ReceiveBotList", bots => {
      Object.entries(bots).forEach(([botId, pos]) => {
        this.events.emit('spawn-bot', botId, pos);
      });
    });

    this.events.on('spawn-bot', (botId: string, state: any) => this._spawnBot(botId, state));

    on("ReceivePlayerPosition", (id, pos) => this._updatePlayerPosition(id, pos));
    on("ReceiveShot", (id, startPos) => this._spawnShot(startPos));
    on("ReceiveHit", () => this._playerGotHit());
    on("ReceiveBotHit", (id, health) => this._botGotHit(id, health));
    on("BotDied", id => this._removeBot(id));
    on("BulletHit", id => this._removeBullet(id));
    on("PlayerLeft", id => this._removePlayer(id));
    on("SpawnBullet", bullet => this._spawnBullet(bullet));
    on("UpdateBullet", bullet => this._updateBullet(bullet));
    on("RemoveBullet", id => this._removeBullet(id));
    on("SpawnEnemyBullet", bullet => this._spawnEnemyBullet(bullet));
    on("UpdateEnemyBullet", bullet => this._updateEnemyBullet(bullet));
    on("RemoveEnemyBullet", id => this._removeEnemyBullet(id));
    on("PlayerHit", (id, health) => this._handlePlayerHit(id, health));
    on("PlayerDied", id => this._handlePlayerDeath(id));
    on("ReceiveBotPosition", (id, pos) => this._updateBotPosition(id, pos));
    on("UpdateScore", score => this._updateScore(score));
  }

  private _spawnBot(botId: string, state: any) {
    const texture = ['enemy_0', 'enemy_1', 'enemy_2'][state.shootingStyle] || 'enemy_0';
    const sprite = this.add.sprite(state.x, state.y, texture)
      .setRotation(Math.PI)
      .setScale(0.25);

    this._bots.set(botId, sprite);
  }

  private _updatePlayerPosition(id: string, pos: any) {
    if (id === this._connectionId) {
      this._playerSprite.setPosition(pos.x, pos.y);
      this._playerHealthText.setText(`HP: ${pos.health}`);
    } else {
      let sprite = this._remotePlayers.get(id);
      if (!sprite) {
        sprite = this.add.sprite(pos.x, pos.y, 'player').setScale(0.25).setTint(0x00ff00);
        this._remotePlayers.set(id, sprite);
      } else {
        sprite.setPosition(pos.x, pos.y);
      }

      let healthText = this._healthTexts.get(id);
      if (!healthText) {
        healthText = this.add.text(pos.x, pos.y - 50, `HP: ${pos.health}`, {
          font: '16px Arial',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 4, y: 2 },
        });
        this._healthTexts.set(id, healthText);
      } else {
        healthText.setText(`HP: ${pos.health}`);
        healthText.setPosition(pos.x - healthText.width / 2, pos.y - 50);
      }
    }
  }

  private _spawnShot(pos: any) {
    const bullet = this.add.circle(pos.x, pos.y, 4, 0xffff00);
    this.physics.add.existing(bullet);
    (bullet.body as Phaser.Physics.Arcade.Body).setVelocity(0, -400);
    this.time.delayedCall(2000, () => bullet.destroy());
  }

  private _playerGotHit() {
    this._playerSprite.setTint(0xff0000);
    this.time.delayedCall(500, () => this._playerSprite.clearTint());
  }

  private _botGotHit(botId: string, _health: number) {
    const bot = this._bots.get(botId);
    if (bot) {
      // TODO: визуализация урона
    }
  }

  private _removeBot(botId: string) {
    const bot = this._bots.get(botId);
    if (bot) {
      bot.destroy();
      this._bots.delete(botId);
    }
  }

  private _removePlayer(playerId: string) {
    const sprite = this._remotePlayers.get(playerId);
    if (sprite) {
      sprite.destroy();
      this._remotePlayers.delete(playerId);
    }
  }

  private _spawnBullet(bullet: any) {
    const sprite = this.add.rectangle(bullet.x, bullet.y, 5, 10, 0xffffff);
    this.physics.add.existing(sprite);
    this._bullets.set(bullet.id, sprite);
  }

  private _updateBullet(bullet: any) {
    const sprite = this._bullets.get(bullet.id);
    if (sprite) sprite.setPosition(bullet.x, bullet.y);
  }

  private _removeBullet(bulletId: string) {
    const sprite = this._bullets.get(bulletId);
    if (sprite) {
      sprite.destroy();
      this._bullets.delete(bulletId);
    }
  }

  private _spawnEnemyBullet(bullet: any) {
    const sprite = this.add.rectangle(bullet.x, bullet.y, 5, 10, 0xff0000);
    this.physics.add.existing(sprite);
    this._enemyBullets.set(bullet.id, sprite);
  }

  private _updateEnemyBullet(bullet: any) {
    const sprite = this._enemyBullets.get(bullet.id);
    if (sprite) sprite.setPosition(bullet.x, bullet.y);
  }

  private _removeEnemyBullet(bulletId: string) {
    const sprite = this._enemyBullets.get(bulletId);
    if (sprite) {
      sprite.destroy();
      this._enemyBullets.delete(bulletId);
    }
  }

  private _handlePlayerHit(playerId: string, health: number) {
    const isLocal = playerId === this._connectionId;
    const sprite = isLocal ? this._playerSprite : this._remotePlayers.get(playerId);

    if (sprite) {
      sprite.setTint(0xff0000);
      this.time.delayedCall(500, () => sprite.clearTint());
    }

    if (isLocal) {
      this._playerHealthText.setText(`HP: ${health}`);
    }
  }

  private _handlePlayerDeath(playerId: string) {
    if (playerId === this._connectionId) {
      this._playerSprite.setVisible(false);
      console.log("You died!");
    } else {
      const remote = this._remotePlayers.get(playerId);
      if (remote) {
        remote.destroy();
        this._remotePlayers.delete(playerId);
      }
    }
  }

  private _updateBotPosition(botId: string, pos: any) {
    const bot = this._bots.get(botId);
    if (bot) {
      bot.setPosition(pos.x, pos.y);
      if (pos.y > this.scale.height) {
        bot.destroy();
        this._bots.delete(botId);
      }
    }
  }

  private _updateScore(score: number) {
    this._scoreText?.setText(`Score: ${score.toFixed(0)}`);
  }


  override update() {
    this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
  }
}
