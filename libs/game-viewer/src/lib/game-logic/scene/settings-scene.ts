import * as Phaser from 'phaser';
import { PhaserMusicService } from '../../services/phaser-music-service/phaser-music-service';

export class SettingsScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private slider!: Phaser.GameObjects.Rectangle;
  private sliderFill!: Phaser.GameObjects.Rectangle;
  private sliderWidth = 300;
  private sliderHeight = 20;
  private currentVolume = 1; // 1 = 100%, 0 = 0%

  constructor(phaserMusicService: PhaserMusicService) {
    super({ key: 'SettingsScene' });
    this._phaserMusicService = phaserMusicService;
  }

  create() {
    this.currentVolume = this._phaserMusicService.getSettings().volume;

    const { width, height } = this.scale;

    this.add.text(width / 2, height / 4, 'Настройки', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Создаем слайдер фона
    this.slider = this.add.rectangle(width / 2, height / 2, this.sliderWidth, this.sliderHeight, 0x555555).setOrigin(0.5);

    // Создаем слайдер заполнения
    this.sliderFill = this.add.rectangle(
      width / 2 - this.sliderWidth / 2,
      height / 2,
      this.sliderWidth * this.currentVolume,
      this.sliderHeight,
      0xffffff
    ).setOrigin(0, 0.5);

    // Текст громкости
    const volumeText = this.add.text(width / 2, height / 2 - 40, `Громкость: ${Math.round(this.currentVolume * 100)}%`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Обработка pointer
    this.slider.setInteractive({ useHandCursor: true });
    this.slider.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.updateVolume(pointer.x);
    });
    this.slider.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) this.updateVolume(pointer.x);
    });

    // Кнопка назад
    this.createButton(width / 2, height / 2 + 80, 'Назад', () => {
      this.scene.start('MainMenuScene');
    });

    // Метод для обновления громкости
    this.updateVolume = (pointerX: number) => {
      const sliderLeft = width / 2 - this.sliderWidth / 2;
      let newVolume = Phaser.Math.Clamp((pointerX - sliderLeft) / this.sliderWidth, 0, 1);
      this.currentVolume = newVolume;

      this.sliderFill.width = this.sliderWidth * this.currentVolume;

      volumeText.setText(`Громкость: ${Math.round(this.currentVolume * 100)}%`);

      this._phaserMusicService.setVolume(this.currentVolume);
    };
  }

  private updateVolume(pointerX: number) {} // будет перезаписан в create()

  createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, text, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#333333' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#000000' }));
    button.on('pointerdown', callback);

    return button;
  }
}
