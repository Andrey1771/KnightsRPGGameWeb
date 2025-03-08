import Phaser from "phaser";

export class Enemies {
  private _enemies!: Phaser.Physics.Arcade.Group;

  private readonly _scene: Phaser.Scene;
  private readonly _cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  private readonly _scaleFactorWidth = 1920;
  private readonly _scaleFactorHeight = 1080;

  constructor(scene: Phaser.Scene) {
    this._scene = scene;
  }

  create() {
    // Группа врагов
    this._enemies = this._scene.physics.add.group();
  }

}
