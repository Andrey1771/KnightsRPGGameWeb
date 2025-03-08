import * as Phaser from 'phaser';
import { Bullet } from '../player/bullet';
import {Player} from "../player/player";

export class KnightsGameScene extends Phaser.Scene {

  private _player!: Player;

  private _background!: Phaser.GameObjects.Image;
  private _bullets!: Phaser.Physics.Arcade.Group;
  private _enemyBullets!: Phaser.Physics.Arcade.Group; // Добавляем группу вражеских пуль
  private _enemies!: Phaser.Physics.Arcade.Group;
  private _playerHP = 3; // Количество жизней


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
    this._enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    // Группа врагов
    this._enemies = this.physics.add.group();

    const cursors = this.input.keyboard?.createCursorKeys();
    this._player = new Player(this, cursors);
    this._player.create();

    // Текстовое поле для отображения HP
    this._hpText = this.add.text(20, 20, `HP: ${this._playerHP}`, {
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

    // Обрабатываем столкновение игрока с вражескими пулями
    this._player.overlap(this._enemyBullets, this.onPlayerHit, undefined, this);
    // Добавляем обработку столкновения игрока с врагами
    this._player.overlap(this._enemies, this.onPlayerCollideWithEnemy, undefined, this);

    // Обрабатываем столкновение пуль игрока с врагами
    this.physics.add.overlap(this._bullets, this._enemies, this.onBulletHitEnemy, undefined, this);
    // Обрабатываем столкновение пуль игрока с вражескими пулями
    this.physics.add.overlap(this._bullets, this._enemyBullets, this.onBulletsCollide, undefined, this);

    // Создаем врагов через случайную генерацию
    this.time.addEvent({
      delay: 2000, // Каждые 2 секунды
      callback: this.spawnRandomEnemy,
      callbackScope: this,
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
    this._playerHP -= 1; // Отнимаем здоровье у игрока
    this._hpText.setText(`HP: ${this._playerHP}`); // Обновляем отображение HP

    if (this._playerHP <= 0) { //TODO Оставить одну
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


  // Функция для создания врагов в случайных местах сверху
  spawnRandomEnemy() {
    const { width, height } = this.scale;

    // Рандомное положение врага сверху
    const randomX = Phaser.Math.Between(0, width);
    const randomEnemyType = Phaser.Math.Between(1, 3); // Рандомный выбор типа врага (1, 2, или 3)
    let enemyTexture = 'enemy1';
    let enemy: any = null;
    switch (randomEnemyType) {
      case 1:
        enemyTexture = 'enemy1';
        enemy = this.spawnEnemy(randomX, 0, enemyTexture, "straight")
        break;
      case 2:
        enemyTexture = 'enemy2';
        enemy = this.spawnEnemy(randomX, 0, enemyTexture, "spread")
        break;
      case 3:
        enemyTexture = 'enemy3';
        enemy = this.spawnEnemy(randomX, 0, enemyTexture, "targeted")
        break;
      default:
        enemy = this.spawnEnemy(randomX, 0, enemyTexture, "straight");
    }

    // Уничтожаем врага, если он выходит за пределы экрана
    //enemy.setCollideWorldBounds(true);
    enemy.setData('toDestroy', false);

    enemy.setData('destroy', () => {
      if (enemy.y >= height - enemy.height/*TODO Размер спрайта противника по y*/) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy(x: number, y: number, texture: string, type: 'straight' | 'spread' | 'targeted') {
    const enemy = this._enemies.create(x, y, texture);

    const { width, height } = this.scale;
    const scaleFactor = Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight);
    enemy.setScale(scaleFactor);

    this._enemies.setName(texture);//TODO!
    enemy.setData('type', type);
    enemy.setVelocityY(100); // Даем врагу скорость вниз

    this.time.addEvent({
      delay: 1500,
      callback: () => this.enemyShoot(enemy),
      loop: true,
    });
    return enemy;
  }

  // Стрельба врага в зависимости от типа
  enemyShoot(enemy: Phaser.GameObjects.GameObject) {
    const type = enemy.getData('type');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore TODO есть необходимо подправить тип?
    const x = enemy.x;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const y = enemy.y;
    if (type === 'straight') {
      this.fireBullet(x, y, 0, this._bulletSpeed);
    } else if (type === 'spread') {
      this.fireBullet(x, y, -100, this._bulletSpeed);
      this.fireBullet(x, y, 0, this._bulletSpeed);
      this.fireBullet(x, y, 100, this._bulletSpeed);
    } else if (type === 'targeted') {
      const angle = Phaser.Math.Angle.Between(x, y, this._player.x, this._player.y);
      this.fireBullet(x, y, Math.cos(angle) * this._bulletSpeed, Math.sin(angle) * this._bulletSpeed);
    }
  }

  // Функция стрельбы
  fireBullet(x: number, y: number, velocityX: number, velocityY: number) {
    const bullet = this._enemyBullets.get() as Bullet;
    if (bullet) {
      bullet.fire(x, y, velocityX, velocityY);
    }
  }

  override update(time: number, delta: number) {
    this._player.updateMoves();

    if (this.input.keyboard?.checkDown(this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), 200)) {
      this.shoot();
    }

    const { width, height } = this.scale;
    // Обновляем все врагов
    this._enemies.getChildren().forEach((enemy) => {
      const enemySprite = enemy as Phaser.GameObjects.Sprite;
      enemySprite.update();

      if (enemySprite.y >= height - enemySprite.height/*TODO Размер спрайта противника по y*/) {
        enemySprite.destroy(); // Удаляем врага
      }
    });

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
    this._playerHP -= 1;

    this._hpText.setText(`HP: ${this._playerHP}`); // Обновляем текст HP

    if (this._playerHP <= 0) {
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
    this._bullets.getChildren().forEach((bullet) => {
      (bullet as Bullet).setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight));
      (bullet as Bullet).x *= scaleFactorX;
      (bullet as Bullet).y *= scaleFactorY;
    });

    this._enemyBullets.getChildren().forEach((bullet) => {
      (bullet as Bullet).setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight));
      (bullet as Bullet).x *= scaleFactorX;
      (bullet as Bullet).y *= scaleFactorY;
    });

    // Пересчитываем всех врагов
    this._enemies.getChildren().forEach((enemy) => {
      (enemy as Phaser.GameObjects.Sprite).setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight));
      (enemy as Phaser.GameObjects.Sprite).x *= scaleFactorX;
      (enemy as Phaser.GameObjects.Sprite).y *= scaleFactorY;
    });

    // Обновляем UI (HP и Score)
    this._hpText.setPosition(20, 20);
    this._scoreText.setPosition(width - 150, 20);
  }

}
