import * as Phaser from 'phaser';
import { Bullet } from '../player/bullet';
import {Player} from "../player/player";
import {Enemies} from "../player/enemies";

export class KnightsGameScene extends Phaser.Scene {

  private _player!: Player;

  private _background!: Phaser.GameObjects.Image;
  private _bullets!: Phaser.Physics.Arcade.Group;
  private _enemies!: Enemies;

  private readonly _bulletSpeed = 160;

  private readonly _scaleFactorWidth = 1920;
  private readonly _scaleFactorHeight = 1080;

  private _hpText!: Phaser.GameObjects.Text; // Текстовое поле для HP
  private _scoreText!: Phaser.GameObjects.Text; // Добавлен текст счета
  private _score = 0; // Переменная счета
  private _gameTime = 0; // Время в игре


  constructor() {
    super({ key: 'main' });
  }

  preload() {
    this.load.spritesheet('ball', 'assets/sprites/player/ball.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('background', 'assets/sprites/background/background.png');
    this.load.image('enemyBullet', 'assets/sprites/bullets/enemyBullet.png'); // Загружаем пулю врага

    this.load.image('enemy1', 'assets/sprites/enemies/enemy1.png');
    this.load.image('enemy2', 'assets/sprites/enemies/enemy2.png');
    this.load.image('enemy3', 'assets/sprites/enemies/enemy3.png');
  }

  create() {
    const { width, height } = this.scale;
    this.scale.on('resize', this.resize, this);

    this._background = this.add.image(width / 2, height / 2, 'background');
    this._background.setName('background');
    this._background.setDisplaySize(width, height);

    this._bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    const cursors = this.input.keyboard?.createCursorKeys();
    this._player = new Player(this, cursors);
    this._player.create();
    this._score = 0

    // Группа врагов
    this._enemies = new Enemies(this, this._player);
    this._enemies.create();

    // Текстовое поле для отображения HP
    this._hpText = this.add.text(20, 20, `HP: ${this._player.hp}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });


    this._scoreText = this.add.text(width - 150, 20, `Score: ${this._score}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // TODO Обрабатываем столкновение игрока с вражескими пулями
    this._player.overlap(this._enemies._enemyBullets, this.onPlayerHit, undefined, this);
    // TODO Добавляем обработку столкновения игрока с врагами
    this._player.overlap(this._enemies._enemies, this.onPlayerCollideWithEnemy, undefined, this);

    // TODO Обрабатываем столкновение пуль игрока с врагами
    this.physics.add.overlap(this._bullets, this._enemies._enemies, this.onBulletHitEnemy, undefined, this);
    // TODO Обрабатываем столкновение пуль игрока с вражескими пулями
    this.physics.add.overlap(this._bullets, this._enemies._enemyBullets, this.onBulletsCollide, undefined, this);

    // Создаем врагов через случайную генерацию
    this.time.addEvent({
      delay: 2000, // Каждые 2 секунды
      callback: this._enemies.spawnRandomEnemy,
      callbackScope: this._enemies,
      loop: true,
    });

    // Таймер для начисления очков за время
    this.time.addEvent({
      delay: 1000, // Каждую секунду
      callback: () => {
        this._gameTime += 1;
        this.addScore(10); // +10 очков за секунду
      },
      callbackScope: this,
      loop: true
    });
  }

  addScore(amount: number) {
    this._score += amount;
    this._scoreText.setText(`Score: ${this._score}`);
  }

  // Метод для обработки столкновения игрока с врагами
  onPlayerCollideWithEnemy(player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    enemy.destroy(); // Уничтожаем врага
    this._player.getHit(1); // Отнимаем здоровье у игрока
    this._hpText.setText(`HP: ${this._player.hp}`); // Обновляем отображение HP

    if (this._player.hp <= 0) { //TODO Оставить одну
      this.playerDeath(); // Если HP закончилось — игрок умирает
    }
  }

  // Обработчик столкновения пуль игрока с вражескими пулями
  onBulletsCollide(playerBullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, enemyBullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    playerBullet.destroy(); // Уничтожаем пулю игрока
    enemyBullet.destroy();  // Уничтожаем пулю врага
  }

// Обработчик попадания пули во врага
  onBulletHitEnemy(bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, enemy: (Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile)) {
    bullet.destroy(); // Удаляем пулю
    enemy.destroy();  // Удаляем врага
    this.addScore(100); // +100 очков за убийство врага
  }




  override update(time: number, delta: number) {
    this._player.updateMoves();

    if (this.input.keyboard?.checkDown(this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), 200)) {
      this.shoot();
    }

    const { width, height } = this.scale;
    this._enemies.update();

    this._bullets.getChildren().forEach((bullet) => {
      (bullet as Bullet).setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight)).update(time, delta);
    });
  }

  shoot() {
    const bullet = this._bullets.get() as Bullet;
    if (bullet) {
      const velocityX = 0;
      const velocityY = -this._bulletSpeed;
      bullet.fire(this._player.x, this._player.y, velocityX, velocityY);
    }
  }

  onPlayerHit(player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    bullet.destroy(); // Удаляем пулю
    this._player.getHit(1);

    this._hpText.setText(`HP: ${this._player.hp}`); // Обновляем текст HP

    if (this._player.hp <= 0) {
      this.playerDeath();
    }
  }

  playerDeath() {
    this._player.die();
    this.time.delayedCall(1000, () => {
      this.scene.restart(); // Перезапуск сцены
    });
  }

  resize(gameSize: Phaser.Structs.Size) {
    const width = this.scale.width;
    const height = this.scale.height;

    const prevWidth = this._background.displayWidth;
    const prevHeight = this._background.displayHeight;

    this.cameras.main.setSize(width, height);
    this.physics.world.setBounds(0, 0, width, height);

    if (this._background) {
      this._background.setDisplaySize(width, height);
      this._background.setPosition(width / 2, height / 2);
    }

    const scaleFactorX = width / prevWidth;
    const scaleFactorY = height / prevHeight;

    // Пересчитываем позицию игрока относительно нового размера

    this._player.resize(prevWidth, prevHeight);

    // Пересчитываем все пули
    this._bullets.getChildren().forEach((b) => {
      const bullet = b as Bullet;
      bullet.setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight));
      bullet.x *= scaleFactorX;
      bullet.y *= scaleFactorY;
    });

    this._enemies.resize(scaleFactorX, scaleFactorY);

    // Обновляем UI (HP и Score)
    this._hpText.setPosition(20, 20);
    this._scoreText.setPosition(width - 150, 20);
  }

}
