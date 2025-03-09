import * as Phaser from 'phaser';
import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
import {Bullet} from "./bullet";

export class Player {
  private _sprite!: SpriteWithDynamicBody;
  public get x() {
    return this._sprite.x
  }
  public get y() {
    return this._sprite.y
  }

  private _playerHP!: number; // Количество жизней
  public get hp() {
    return this._playerHP
  }

  private readonly _playerSpeed = 160;

  private readonly _scene: Phaser.Scene;
  private readonly _cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  // TODO private
  public _bullets!: Phaser.Physics.Arcade.Group;

  private readonly _bulletSpeed = 160;

  private readonly _scaleFactorWidth = 1920;
  private readonly _scaleFactorHeight = 1080;

  constructor(scene: Phaser.Scene, cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined) {
    this._scene = scene;
    this._cursors = cursors;
  }

  create() {
    this._sprite = this._scene.physics.add.sprite(100, 450, 'ball', 64);
    this._sprite.setCollideWorldBounds(true);
    const { width, height } = this._scene.scale;
    const scaleFactor = Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight);
    this._sprite.setScale(scaleFactor);

    this._playerHP = 3;

    this._bullets = this._scene.physics.add.group({ classType: Bullet, runChildUpdate: true });
  }

  overlap(object2: Phaser.Types.Physics.Arcade.ArcadeColliderType, collideCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback | undefined, processCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback | undefined, callbackContext?: any): Phaser.Physics.Arcade.Collider {
    return this._scene.physics.add.overlap(this._sprite, object2, collideCallback, processCallback, callbackContext);
  }

  die() {
    console.log('Игрок погиб!');
    this._sprite.setTint(0xff0000);
    this._sprite.setVelocity(0, 0);
    this._sprite.anims.stop();
  }

  getHit(damage: number) {
    this._playerHP -= damage;
  }

  resize(prevWidth: number, prevHeight: number) {
    const { width, height } = this._scene.scale;
    const scaleFactorX = width / prevWidth;
    const scaleFactorY = height / prevHeight;

    this._sprite.setPosition(this._sprite.x * scaleFactorX, this._sprite.y * scaleFactorY);


    const scaleFactor = Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight);
    this._sprite.setScale(scaleFactor);

    this.resizeBullets(scaleFactorX, scaleFactorY);
  }

  private resizeBullets(scaleFactorX: number, scaleFactorY: number) {
    const { width, height } = this._scene.scale;

    // Пересчитываем все пули
    this._bullets.getChildren().forEach((b) => {
      const bullet = b as Bullet;
      bullet.setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight));
      bullet.x *= scaleFactorX;
      bullet.y *= scaleFactorY;
    });
  }

  private updateMoves() {
    const cursors = this._cursors;
    const isLeftDown = cursors?.left.isDown;
    const isRightDown = cursors?.right.isDown;
    const isUpDown = cursors?.up.isDown;
    const isDownDown = cursors?.down.isDown;

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
    this._sprite.setVelocityX(velocityX);
    this._sprite.setVelocityY(velocityY);

    // Включаем анимацию в зависимости от направления
    if (velocityX < 0) {
      this._sprite.anims.play('left', true);
    } else if (velocityX > 0) {
      this._sprite.anims.play('right', true);
    } else if (velocityY < 0) {
      this._sprite.anims.play('up', true);
    } else if (velocityY > 0) {
      this._sprite.anims.play('down', true);
    } else {
      this._sprite.anims.play('turn', true); // Если не двигается
    }
  }

  update(time: number, delta: number) {
    this.updateMoves();

    if (this._scene.input.keyboard?.checkDown(this._scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), 200)) {
      this.shoot();
    }

    this.updateBullets(time, delta);
  }

  private updateBullets(time: number, delta: number) {
    const { width, height } = this._scene.scale;

    this._bullets.getChildren().forEach((bullet) => {
      (bullet as Bullet).setScale(Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight)).update(time, delta);
    });
  }

  shoot() {
    const bullet = this._bullets.get() as Bullet;
    if (bullet) {
      const velocityX = 0;
      const velocityY = -this._bulletSpeed;
      bullet.fire(this.x, this.y, velocityX, velocityY);
    }
  }
}
