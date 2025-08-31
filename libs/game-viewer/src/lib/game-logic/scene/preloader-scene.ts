import * as Phaser from 'phaser';
import { MusicTrack, SoundsTrack } from '../../services/phaser-music-service/phaser-music-service';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // Загружаем музыку
    this.load.audio(MusicTrack.MainTheme, 'assets/music/menu_theme.mp3');
    this.load.audio(MusicTrack.BattleTheme, 'assets/music/main_battle_theme.mp3');

    // Загружаем звуки
    this.load.audio(SoundsTrack.EnemyLaser, 'assets/sounds/enemy_laser.wav');
    this.load.audio(SoundsTrack.PlayerLaser, 'assets/sounds/player_laser.wav');

    // Загружаем спрайты и картинки
    this.load.image('background', 'assets/sprites/background/background.png');
    this.load.image('menuBg', 'assets/sprites/background/mainMenuBackground.jpg');

    this.load.spritesheet('player', 'assets/sprites/player/player_0.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('enemy_0', 'assets/sprites/enemies/enemy_0.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('enemy_1', 'assets/sprites/enemies/enemy_1.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('enemy_2', 'assets/sprites/enemies/enemy_2.png', { frameWidth: 256, frameHeight: 256 });
  }

  create() {
    this.scene.start('MainMenuScene');
  }
}
