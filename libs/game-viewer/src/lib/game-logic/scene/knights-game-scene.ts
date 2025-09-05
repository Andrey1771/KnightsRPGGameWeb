import * as Phaser from 'phaser';
import {Player} from "../player/player";
import {Enemies} from "../player/enemies";

export class KnightsGameScene extends Phaser.Scene {
  private _player!: Player;

  private _background!: Phaser.GameObjects.Image;
  private _enemies!: Enemies;

  private _hpText!: Phaser.GameObjects.Text; // Текстовое поле для HP
  private _scoreText!: Phaser.GameObjects.Text; // Добавлен текст счета
  private _score = 0; // Переменная счета
  private _gameTime = 0; // Время в игре


  constructor() {
    super({ key: 'main' });
  }

  create() {
    this.scene.launch('UIOverlayScene', { showPauseButton: false, showName: false, readOnly: true });

    const { width, height } = this.scale;
    this.scale.on('resize', this.resize, this);

    this._background = this.add.image(width / 2, height / 2, 'background');
    this._background.setName('background');
    this._background.setDisplaySize(width, height);



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
    this.physics.add.overlap(this._player._bullets, this._enemies._enemies, this.onBulletHitEnemy, undefined, this);
    // TODO Обрабатываем столкновение пуль игрока с вражескими пулями
    this.physics.add.overlap(this._player._bullets, this._enemies._enemyBullets, this.onBulletsCollide, undefined, this);

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

  onPlayerHit(playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
              bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile) {
    const bullet = bulletObj as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    bullet.destroy();
    this._player.getHit(1);
    this._hpText.setText(`HP: ${this._player.hp}`);

    if (this._player.hp <= 0) {
      this.playerDeath();
    }
  }

  onPlayerCollideWithEnemy(playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
                           enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile) {
    const enemy = enemyObj as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    enemy.destroy();
    this._player.getHit(1);
    this._hpText.setText(`HP: ${this._player.hp}`);

    if (this._player.hp <= 0) {
      this.playerDeath();
    }
  }

  onBulletsCollide(playerBulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
                   enemyBulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile) {
    const playerBullet = playerBulletObj as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    const enemyBullet = enemyBulletObj as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    playerBullet.destroy();
    enemyBullet.destroy();
  }

  onBulletHitEnemy(bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
                   enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile) {
    const bullet = bulletObj as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    const enemy = enemyObj as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    bullet.destroy();
    enemy.destroy();
    this.addScore(100);
  }

  override update(time: number, delta: number) {
    this._player.update(time, delta);
    this._enemies.update();
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

    this._enemies.resize(scaleFactorX, scaleFactorY);

    // Обновляем UI (HP и Score)
    this._hpText.setPosition(20, 20);
    this._scoreText.setPosition(width - 150, 20);
  }

}
