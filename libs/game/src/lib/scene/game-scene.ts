import * as Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'main' });
  }

  init() {
    console.log('init method');
  }
  preload() {
    console.log('preload method');
  }
  create() {
    console.log('create method');
  }
}