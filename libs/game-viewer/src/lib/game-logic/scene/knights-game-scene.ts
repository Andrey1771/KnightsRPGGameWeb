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

  constructor() {
    super({ key: 'main' });
  }

  preload() {
    this.load.spritesheet('ball', 'assets/sprites/player/ball.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('background', 'assets/sprites/background/background.png');
    this.load.image('enemyBullet', 'assets/sprites/bullets/enemyBullet.png'); // Загружаем пулю врага
  }

  create() {
    const { width, height } = this.scale;
    this.scale.on('resize', this.resize, this);

    this._background = this.add.image(width / 2, height / 2, 'background');
    this._background.setName('background');
    this._background.setDisplaySize(width, height);

    this._bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this._enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

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

    // Тест: стрельба врага (удали или замени на свою логику)
    this.time.addEvent({
      delay: 1000,
      callback: this.enemyShoot,
      callbackScope: this,
      loop: true,
    });
  }

  override update(time: number, delta: number) {
    this.updateMovesPlayer();

    if (this.input.keyboard?.checkDown(this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), 200)) {
      this.shoot();
    }

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

  enemyShoot() {
    const enemyBullet = this._enemyBullets.get() as Bullet;
    if (enemyBullet) {
      const velocityX = 0;
      const velocityY = this._bulletSpeed;
      enemyBullet.fire(Phaser.Math.Between(50, this.scale.width - 50), 50, velocityX, velocityY);
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

//
//
//
//
//
//
// var config = {
//   type: Phaser.AUTO,
//   parent: 'phaser-example',
//   width: 800,
//   height: 600,
//   physics: {
//     default: 'arcade',
//     arcade: {
//       gravity: { y: 0 },
//       debug: false
//     }
//   },
//   scene: {
//     preload: preload,
//     create: create,
//     update: update,
//     extend: {
//       player: null,
//       healthpoints: null,
//       reticle: null,
//       moveKeys: null,
//       playerBullets: null,
//       enemyBullets: null,
//       time: 0,
//     }
//   }
// };
//
// var game = new Phaser.Game(config);
//
// var Bullet = new Phaser.Class({
//
//   Extends: Phaser.GameObjects.Image,
//
//   initialize:
//
//   // Bullet Constructor
//     function Bullet (scene)
//     {
//       Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
//       this.speed = 1;
//       this.born = 0;
//       this.direction = 0;
//       this.xSpeed = 0;
//       this.ySpeed = 0;
//       this.setSize(12, 12, true);
//     },
//
//   // Fires a bullet from the player to the reticle
//   fire: function (shooter, target)
//   {
//     this.setPosition(shooter.x, shooter.y); // Initial position
//     this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));
//
//     // Calculate X and y velocity of bullet to moves it from shooter to target
//     if (target.y >= this.y)
//     {
//       this.xSpeed = this.speed*Math.sin(this.direction);
//       this.ySpeed = this.speed*Math.cos(this.direction);
//     }
//     else
//     {
//       this.xSpeed = -this.speed*Math.sin(this.direction);
//       this.ySpeed = -this.speed*Math.cos(this.direction);
//     }
//
//     this.rotation = shooter.rotation; // angle bullet with shooters rotation
//     this.born = 0; // Time since new bullet spawned
//   },
//
//   // Updates the position of the bullet each cycle
//   update: function (time, delta)
//   {
//     this.x += this.xSpeed * delta;
//     this.y += this.ySpeed * delta;
//     this.born += delta;
//     if (this.born > 1800)
//     {
//       this.setActive(false);
//       this.setVisible(false);
//     }
//   }
//
// });
//
// function create ()
// {
//   // Set world bounds
//   this.physics.world.setBounds(0, 0, 1600, 1200);
//
//   // Add 2 groups for Bullet objects
//   playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
//   enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
//
//   // Add background player, enemy, reticle, healthpoint sprites
//   var background = this.add.image(800, 600, 'background');
//   player = this.physics.add.sprite(800, 600, 'player_handgun');
//   enemy = this.physics.add.sprite(300, 600, 'player_handgun');
//   reticle = this.physics.add.sprite(800, 700, 'target');
//   hp1 = this.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5);
//   hp2 = this.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5);
//   hp3 = this.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5);
//
//   // Set image/sprite properties
//   background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
//   player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(500, 500);
//   enemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
//   reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);
//   hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
//   hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
//   hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
//
//   // Set sprite variables
//   player.health = 3;
//   enemy.health = 3;
//   enemy.lastFired = 0;
//
//   // Set camera properties
//   this.cameras.main.zoom = 0.5;
//   this.cameras.main.startFollow(player);
//
//   // Creates object for input with WASD kets
//   moveKeys = this.input.keyboard.addKeys({
//     'up': Phaser.Input.Keyboard.KeyCodes.W,
//     'down': Phaser.Input.Keyboard.KeyCodes.S,
//     'left': Phaser.Input.Keyboard.KeyCodes.A,
//     'right': Phaser.Input.Keyboard.KeyCodes.D
//   });
//
//   // Enables movement of player with WASD keys
//   this.input.keyboard.on('keydown_W', function (event) {
//     player.setAccelerationY(-800);
//   });
//   this.input.keyboard.on('keydown_S', function (event) {
//     player.setAccelerationY(800);
//   });
//   this.input.keyboard.on('keydown_A', function (event) {
//     player.setAccelerationX(-800);
//   });
//   this.input.keyboard.on('keydown_D', function (event) {
//     player.setAccelerationX(800);
//   });
//
//   // Stops player acceleration on uppress of WASD keys
//   this.input.keyboard.on('keyup_W', function (event) {
//     if (moveKeys['down'].isUp)
//       player.setAccelerationY(0);
//   });
//   this.input.keyboard.on('keyup_S', function (event) {
//     if (moveKeys['up'].isUp)
//       player.setAccelerationY(0);
//   });
//   this.input.keyboard.on('keyup_A', function (event) {
//     if (moveKeys['right'].isUp)
//       player.setAccelerationX(0);
//   });
//   this.input.keyboard.on('keyup_D', function (event) {
//     if (moveKeys['left'].isUp)
//       player.setAccelerationX(0);
//   });
//
//   // Fires bullet from player on left click of mouse
//   this.input.on('pointerdown', function (pointer, time, lastFired) {
//     if (player.active === false)
//       return;
//
//     // Get bullet from bullets group
//     var bullet = playerBullets.get().setActive(true).setVisible(true);
//
//     if (bullet)
//     {
//       bullet.fire(player, reticle);
//       this.physics.add.collider(enemy, bullet, enemyHitCallback);
//     }
//   }, this);
//
//   // Pointer lock will only work after mousedown
//   game.canvas.addEventListener('mousedown', function () {
//     game.input.mouse.requestPointerLock();
//   });
//
//   // Exit pointer lock when Q or escape (by default) is pressed.
//   this.input.keyboard.on('keydown_Q', function (event) {
//     if (game.input.mouse.locked)
//       game.input.mouse.releasePointerLock();
//   }, 0, this);
//
//   // Move reticle upon locked pointer move
//   this.input.on('pointermove', function (pointer) {
//     if (this.input.mouse.locked)
//     {
//       reticle.x += pointer.movementX;
//       reticle.y += pointer.movementY;
//     }
//   }, this);
//
// }
//
// function enemyHitCallback(enemyHit, bulletHit)
// {
//   // Reduce health of enemy
//   if (bulletHit.active === true && enemyHit.active === true)
//   {
//     enemyHit.health = enemyHit.health - 1;
//     console.log("Enemy hp: ", enemyHit.health);
//
//     // Kill enemy if health <= 0
//     if (enemyHit.health <= 0)
//     {
//       enemyHit.setActive(false).setVisible(false);
//     }
//
//     // Destroy bullet
//     bulletHit.setActive(false).setVisible(false);
//   }
// }
//
// function playerHitCallback(playerHit, bulletHit)
// {
//   // Reduce health of player
//   if (bulletHit.active === true && playerHit.active === true)
//   {
//     playerHit.health = playerHit.health - 1;
//     console.log("Player hp: ", playerHit.health);
//
//     // Kill hp sprites and kill player if health <= 0
//     if (playerHit.health == 2)
//     {
//       hp3.destroy();
//     }
//     else if (playerHit.health == 1)
//     {
//       hp2.destroy();
//     }
//     else
//     {
//       hp1.destroy();
//       // Game over state should execute here
//     }
//
//     // Destroy bullet
//     bulletHit.setActive(false).setVisible(false);
//   }
// }
//
// function enemyFire(enemy, player, time, gameObject)
// {
//   if (enemy.active === false)
//   {
//     return;
//   }
//
//   if ((time - enemy.lastFired) > 1000)
//   {
//     enemy.lastFired = time;
//
//     // Get bullet from bullets group
//     var bullet = enemyBullets.get().setActive(true).setVisible(true);
//
//     if (bullet)
//     {
//       bullet.fire(enemy, player);
//       // Add collider between bullet and player
//       gameObject.physics.add.collider(player, bullet, playerHitCallback);
//     }
//   }
// }
//
// // Ensures sprite speed doesnt exceed maxVelocity while update is called
// function constrainVelocity(sprite, maxVelocity)
// {
//   if (!sprite || !sprite.body)
//     return;
//
//   var angle, currVelocitySqr, vx, vy;
//   vx = sprite.body.velocity.x;
//   vy = sprite.body.velocity.y;
//   currVelocitySqr = vx * vx + vy * vy;
//
//   if (currVelocitySqr > maxVelocity * maxVelocity)
//   {
//     angle = Math.atan2(vy, vx);
//     vx = Math.cos(angle) * maxVelocity;
//     vy = Math.sin(angle) * maxVelocity;
//     sprite.body.velocity.x = vx;
//     sprite.body.velocity.y = vy;
//   }
// }
//
// // Ensures reticle does not move offscreen
// function constrainReticle(reticle)
// {
//   var distX = reticle.x-player.x; // X distance between player & reticle
//   var distY = reticle.y-player.y; // Y distance between player & reticle
//
//   // Ensures reticle cannot be moved offscreen (player follow)
//   if (distX > 800)
//     reticle.x = player.x+800;
//   else if (distX < -800)
//     reticle.x = player.x-800;
//
//   if (distY > 600)
//     reticle.y = player.y+600;
//   else if (distY < -600)
//     reticle.y = player.y-600;
// }
//
// function update (time, delta)
// {
//   // Rotates player to face towards reticle
//   player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);
//
//   // Rotates enemy to face towards player
//   enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
//
//   //Make reticle move with player
//   reticle.body.velocity.x = player.body.velocity.x;
//   reticle.body.velocity.y = player.body.velocity.y;
//
//   // Constrain velocity of player
//   constrainVelocity(player, 500);
//
//   // Constrain position of constrainReticle
//   constrainReticle(reticle);
//
//   // Make enemy fire
//   enemyFire(enemy, player, time, this);
// }
