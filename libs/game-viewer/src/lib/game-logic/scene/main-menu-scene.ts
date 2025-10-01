import { MusicTrack, PhaserMusicService } from '../../services/phaser-music-service/phaser-music-service';
import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private playerNameInput!: any; // rexUI InputText

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    this._phaserMusicService = this.registry.get('musicService') as PhaserMusicService;

    this.scene.launch('UIOverlayScene', { showPauseButton: false, showName: true, readOnly: false });

    this._phaserMusicService.init(this);
    this._phaserMusicService.playMusic(MusicTrack.MainTheme);

    const { width, height } = this.scale;

    // Создаём несколько планет
    const planetSizes = [96, 128, 112];
    for (let i = 0; i < 3; i++) {
      const planet = this.generatePlanet(planetSizes[i], planetSizes[i]);
      planet.setPosition(width * 0.3 + i * 200, height * 0.5 + Phaser.Math.Between(-50, 50));
      planet.setScale(0.8 + i * 0.2); // Разный масштаб

      this.tweens.add({
        targets: planet,
        angle: 360,
        duration: 40000 + i * 20000, // Разная скорость вращения
        repeat: -1
      });
    }

    // Заголовок
    this.add.text(width / 2, height * 0.15, 'Knights Game', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопки меню
    const buttonSpacing = 80;
    const startY = height * 0.4;
    const centerX = width / 2;

    this.createButton(centerX, startY, 'Начать игру', () => this.scene.start('main'));
    this.createButton(centerX, startY + buttonSpacing, 'Создать игру', () => this.scene.start('CreateLobbyScene'));
    this.createButton(centerX, startY + buttonSpacing * 2, 'Присоединиться', () => this.scene.start('JoinLobbyScene'));
    this.createButton(centerX, startY + buttonSpacing * 3, 'Настройки', () => this.scene.start('SettingsScene'));
  }

  createButton(x: number, y: number, text: string, callback: () => void) {
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

  generatePlanet(width: number, height: number): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);

    // Создаём графический объект для планеты
    const planetGraphics = this.add.graphics();

    // Случайные цвета для планеты
    const baseColor = Phaser.Display.Color.RandomRGB();
    const darkColor = Phaser.Display.Color.GetColor(
      Math.max(0, baseColor.red - 40),
      Math.max(0, baseColor.green - 40),
      Math.max(0, baseColor.blue - 40)
    );
    const lightColor = Phaser.Display.Color.GetColor(
      Math.min(255, baseColor.red + 40),
      Math.min(255, baseColor.green + 40),
      Math.min(255, baseColor.blue + 40)
    );

    // Рисуем основную планету с градиентом
    const radius = Math.min(width, height) / 2;

    // Основной круг планеты
    planetGraphics.fillStyle(baseColor.color);
    planetGraphics.fillCircle(0, 0, radius);

    // Добавляем текстуру кратеров и деталей
    const detailGraphics = this.add.graphics();

    // Создаём кратеры и детали поверхности
    for (let i = 0; i < 15; i++) {
      const craterRadius = Phaser.Math.Between(5, 20);
      const angle = Phaser.Math.Between(0, 360);
      const distance = Phaser.Math.Between(0, radius - craterRadius - 5);

      const x = Math.cos(Phaser.Math.DegToRad(angle)) * distance;
      const y = Math.sin(Phaser.Math.DegToRad(angle)) * distance;

      // Чередуем тёмные и светлые кратеры для текстуры
      if (Math.random() > 0.5) {
        detailGraphics.fillStyle(darkColor, 0.7);
      } else {
        detailGraphics.fillStyle(lightColor, 0.5);
      }

      detailGraphics.fillCircle(x, y, craterRadius);

      // Добавляем маленький кратер внутри большого для объёма
      if (craterRadius > 10) {
        detailGraphics.fillStyle(darkColor, 0.3);
        detailGraphics.fillCircle(x - craterRadius * 0.3, y - craterRadius * 0.3, craterRadius * 0.4);
      }
    }

    // Добавляем большие континентальные массы
    for (let i = 0; i < 3; i++) {
      const continentRadius = Phaser.Math.Between(15, 35);
      const angle = Phaser.Math.Between(0, 360);
      const distance = Phaser.Math.Between(0, radius - continentRadius - 10);

      const x = Math.cos(Phaser.Math.DegToRad(angle)) * distance;
      const y = Math.sin(Phaser.Math.DegToRad(angle)) * distance;

      detailGraphics.fillStyle(lightColor, 0.3);
      detailGraphics.fillCircle(x, y, continentRadius);
    }

    // Атмосфера
    const atmosphere = this.add.graphics();
    atmosphere.fillStyle(0x88ccff, 0.2);
    atmosphere.fillCircle(0, 0, radius + 8);

    // Облака
    const clouds = this.add.graphics();
    clouds.fillStyle(0xffffff, 0.15);

    for (let i = 0; i < 8; i++) {
      const cloudRadius = Phaser.Math.Between(8, 18);
      const angle = Phaser.Math.Between(0, 360);
      const distance = Phaser.Math.Between(radius * 0.7, radius - 5);

      const x = Math.cos(Phaser.Math.DegToRad(angle)) * distance;
      const y = Math.sin(Phaser.Math.DegToRad(angle)) * distance;

      clouds.fillCircle(x, y, cloudRadius);

      // Добавляем дополнительные части облаков для более естественного вида
      if (Math.random() > 0.5) {
        clouds.fillCircle(x + cloudRadius * 0.7, y, cloudRadius * 0.8);
        clouds.fillCircle(x, y + cloudRadius * 0.7, cloudRadius * 0.6);
      }
    }

    // Добавляем все элементы в контейнер в правильном порядке
    container.add(planetGraphics);
    container.add(detailGraphics);
    container.add(atmosphere);
    container.add(clouds);

    // Анимация облаков
    this.tweens.add({
      targets: clouds,
      angle: 360,
      duration: 180000, // Медленнее для более плавного движения
      repeat: -1
    });

    return container;
  }
}
