export class Bullet extends Phaser.Physics.Arcade.Sprite {
  private readonly _speed: number = 500;

  private _scene: Phaser.Scene;

  private readonly _scaleFactorWidth = 1920;
  private readonly _scaleFactorHeight = 1080;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ball'); // Тут вместо 'ball' будет текстура пули
    this._scene = scene;
    scene.add.existing(this);
    scene.physics.world.enable(this);
    this.setActive(false);
    this.setVisible(false);
  }

  fire(x: number, y: number, velocityX: number, velocityY: number) {

    const { width, height } = this._scene.scale;
    const scaleFactor = Math.min(width / this._scaleFactorWidth, height / this._scaleFactorHeight);
    this.setScale(scaleFactor);

    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocity(velocityX, velocityY);
  }

  override update(time: number, delta: number) {
    // Удаляем пулю, если она выходит за пределы экрана
    const { width, height } =  this.scene.scale;
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
