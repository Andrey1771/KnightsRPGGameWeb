import SpriteWithDynamicBody = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export class Player {
  private sprite: SpriteWithDynamicBody | null = null;

  constructor() {
    this.sprite =
    this.sprite
      .setOrigin(0.5, 0.5)
      .setDisplaySize(132, 120)
      .setCollideWorldBounds(true)
      .setDrag(500, 500);
  }
}
