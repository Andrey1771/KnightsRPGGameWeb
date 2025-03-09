import * as Phaser from 'phaser';
import {Bullet} from "./bullet";
import {Player} from "./player";

export class Enemies {
  //TODO private
  public _enemies!: Phaser.Physics.Arcade.Group;
  //TODO private
  public _enemyBullets!: Phaser.Physics.Arcade.Group; // Добавляем группу вражеских пуль

  private readonly _scene: Phaser.Scene;

  private readonly _scaleFactorWidth = 1920;
  private readonly _scaleFactorHeight = 1080;

  private readonly _bulletSpeed = 160;

  private readonly _player: Player;

  constructor(scene: Phaser.Scene, player: Player) {
    this._scene = scene;
    this._player = player;
  }


  create() {
    this._enemyBullets = this._scene.physics.add.group({ classType: Bullet, runChildUpdate: true });
    // Группа врагов
    this._enemies = this._scene.physics.add.group();
  }

  overlap(object2: Phaser.Types.Physics.Arcade.ArcadeColliderType, collideCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback | undefined, processCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback | undefined, callbackContext?: any): Phaser.Physics.Arcade.Collider {
    return this._scene.physics.add.overlap(this._enemies, object2, collideCallback, processCallback, callbackContext);
  }

  update() {
    const { height } = this._scene.scale;
    // Обновляем всех врагов
    this._enemies.getChildren().forEach((enemy) => {
      const enemySprite = enemy as Phaser.GameObjects.Sprite;
      enemySprite.update();

      if (enemySprite.y >= height - enemySprite.height/*TODO Размер спрайта противника по y*/) {
        enemySprite.destroy(); // Удаляем врага
      }
    });
  }

  // Функция для создания врагов в случайных местах сверху
  spawnRandomEnemy() {
    const { width, height } = this._scene.scale;

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

    const { width, height } = this._scene.scale;
    const scaleFactor = Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight);
    enemy.setScale(scaleFactor);

    this._enemies.setName(texture);//TODO!
    enemy.setData('type', type);
    enemy.setVelocityY(100); // Даем врагу скорость вниз

    this._scene.time.addEvent({
      delay: 1500,
      callback: () => this.enemyShoot(enemy),
      loop: true,
    });
    return enemy;
  }

  // Стрельба врага в зависимости от типа
  enemyShoot(e: Phaser.GameObjects.GameObject) {
    const type = e.getData('type');
    const enemy = e as Phaser.GameObjects.Sprite;

    const x = enemy.x;
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

  resize(scaleFactorX: number, scaleFactorY: number) {
    const { width, height } = this._scene.scale;

    this._enemyBullets.getChildren().forEach((b) => {
      const bullet = b as Phaser.GameObjects.Sprite
      bullet.setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight));
      bullet.x *= scaleFactorX;
      bullet.y *= scaleFactorY;
    });

    // Пересчитываем всех врагов
    this._enemies.getChildren().forEach((e) => {
      const enemy = e as Phaser.GameObjects.Sprite
      enemy.setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight));
      enemy.x *= scaleFactorX;
      enemy.y *= scaleFactorY;
    });
  }
}
