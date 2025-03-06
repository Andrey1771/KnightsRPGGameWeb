import * as Phaser from 'phaser';
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import { Bullet } from '../player/bullet';

export class KnightsGameScene extends Phaser.Scene {
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private _player!: SpriteWithDynamicBody;
  private _background!: Phaser.GameObjects.Image;
  private _bullets!: Phaser.Physics.Arcade.Group;
  private _enemyBullets!: Phaser.Physics.Arcade.Group; // Добавляем группу вражеских пуль
  private _playerHP = 3; // Количество жизней

  private readonly _playerSpeed = 160;
  private readonly _bulletSpeed = 160;

  private readonly _scaleFactorWidth = 1920;
  private readonly _scaleFactorHeight = 1080;

  private _hpText!: Phaser.GameObjects.Text; // Текстовое поле для HP

  private _enemies!: Phaser.Physics.Arcade.Group;


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


    this._player = this.physics.add.sprite(100, 450, 'ball', 64);
    this._player.setBounce(0.2);
    this._player.setCollideWorldBounds(true);
    const scaleFactor = Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight);
    this._player.setScale(scaleFactor);

    this._cursors = this.input.keyboard?.createCursorKeys();

    // Текстовое поле для отображения HP
    this._hpText = this.add.text(20, 20, `HP: ${this._playerHP}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // Обрабатываем столкновение игрока с вражескими пулями
    this.physics.add.overlap(this._player, this._enemyBullets, this.onPlayerHit, undefined, this);

    // Обрабатываем столкновение пуль игрока с врагами
    this.physics.add.overlap(this._bullets, this._enemies, this.onBulletHitEnemy, undefined, this);

    // Создаем врагов через случайную генерацию
    this.time.addEvent({
      delay: 2000, // Каждые 2 секунды
      callback: this.spawnRandomEnemy,
      callbackScope: this,
      loop: true,
    });
  }

// Обработчик попадания пули во врага
  onBulletHitEnemy(bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, enemy: (Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile)) {
    bullet.destroy(); // Удаляем пулю
    enemy.destroy();  // Удаляем врага
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
    enemy.setCollideWorldBounds(true);
    enemy.setData('toDestroy', false);

    enemy.setData('destroy', () => {
      if (enemy.y > height) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy(x: number, y: number, texture: string, type: 'straight' | 'spread' | 'targeted') {
    const enemy = this._enemies.create(x, y, texture);
    this._enemies.setName(texture);//TODO!
    enemy.setData('type', type);
    enemy.setCollideWorldBounds(true); // Добавляем коллизии с миром
    enemy.setBounce(0.2); // Устанавливаем отскок
    enemy.setVelocityY(100); // Даем врагу скорость вниз

    this.time.addEvent({
      delay: 1500,
      callback: () => this.enemyShoot(enemy, x, y),
      loop: true,
    });
    return enemy;
  }

  // Стрельба врага в зависимости от типа
  enemyShoot(enemy: Phaser.GameObjects.GameObject, x: number, y: number) {
    const type = enemy.getData('type');

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
    this.updateMovesPlayer();

    if (this.input.keyboard?.checkDown(this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), 200)) {
      this.shoot();
    }

    // Обновляем все врагов
    this._enemies.getChildren().forEach((enemy) => {
      (enemy as Phaser.GameObjects.Sprite).update();
      (enemy as Phaser.GameObjects.Sprite).getData('destroy')();
    });

    const { width, height } = this.scale;
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
    console.log('Игрок погиб!');
    this._player.setTint(0xff0000);
    this._player.setVelocity(0, 0);
    this._player.anims.stop();
    this.time.delayedCall(1000, () => {
      this.scene.restart(); // Перезапуск сцены
    });
  }

  updateMovesPlayer() {
    const isLeftDown = this._cursors?.left.isDown;
    const isRightDown = this._cursors?.right.isDown;
    const isUpDown = this._cursors?.up.isDown;
    const isDownDown = this._cursors?.down.isDown;

    // Переменные для хранения скорости по осям X и Y
    let velocityX = 0;
    let velocityY = 0;

    // Проверяем нажатие нескольких клавиш и устанавливаем значения скорости
    if (isLeftDown && isUpDown) {
      velocityX = -this._playerSpeed / Math.sqrt(2);
      velocityY = -this._playerSpeed / Math.sqrt(2);
    } else if (isLeftDown && isDownDown) {
      velocityX = -this._playerSpeed / Math.sqrt(2);
      velocityY = this._playerSpeed / Math.sqrt(2);
    } else if (isRightDown && isUpDown) {
      velocityX = this._playerSpeed / Math.sqrt(2);
      velocityY = -this._playerSpeed / Math.sqrt(2);
    } else if (isRightDown && isDownDown) {
      velocityX = this._playerSpeed / Math.sqrt(2);
      velocityY = this._playerSpeed / Math.sqrt(2);
    }
    // Для обычных направлений
    else if (isLeftDown) {
      velocityX = -this._playerSpeed;
    } else if (isRightDown) {
      velocityX = this._playerSpeed;
    } else if (isUpDown) {
      velocityY = -this._playerSpeed;
    } else if (isDownDown) {
      velocityY = this._playerSpeed;
    }

    // Устанавливаем скорости перемещения
    this._player.setVelocityX(velocityX);
    this._player.setVelocityY(velocityY);

    // Включаем анимацию в зависимости от направления
    if (velocityX < 0) {
      this._player.anims.play('left', true);
    } else if (velocityX > 0) {
      this._player.anims.play('right', true);
    } else if (velocityY < 0) {
      this._player.anims.play('up', true);
    } else if (velocityY > 0) {
      this._player.anims.play('down', true);
    } else {
      this._player.anims.play('turn', true); // Если не двигается
    }
  }

  resize(gameSize: Phaser.Structs.Size) {
    const { width, height } = gameSize;
    this.cameras.main.setSize(width, height);
    this.physics.world.setBounds(0, 0, width, height);

    if (this._background) {
      this._background.setDisplaySize(width, height);
      this._background.setPosition(width / 2, height / 2);
    }

    if (this._player) {
      const scaleFactor = Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight);
      this._player.setScale(scaleFactor);
      this._player.setCollideWorldBounds(true);
    }

    this._bullets.getChildren().forEach((bullet) => {
      (bullet as Bullet).setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight));
    });
  }
}
