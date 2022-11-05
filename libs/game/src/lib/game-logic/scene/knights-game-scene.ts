import * as Phaser from "phaser";

export class KnightsGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'main' });
  }

  init() {
    console.log('init method');
  }
  preload() {
    console.log('preload method');
    // Load in images and sprites
    this.load.spritesheet('playerSprite', 'assets/sprites/player/playerSprite.png',
      { frameWidth: 66, frameHeight: 60 }
    ); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
    //this.load.image('bullet', 'assets/sprites/bullets/bullet6.png');
    //this.load.image('target', 'assets/demoscene/ball.png');
    //this.load.image('background', 'assets/skies/underwater1.png');
  }
  create() {
    console.log('create method');
    const player = this.physics.add.sprite(800, 600, 'playerSprite');
    player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(500, 500);
  }
}
