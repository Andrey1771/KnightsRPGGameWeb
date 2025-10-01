import { MusicTrack, PhaserMusicService } from '../../services/phaser-music-service/phaser-music-service';
import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private playerNameInput!: any;
  private stars: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private nebulae: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    // Создаём простую текстуру для звезды
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xffffff, 1);
    starGraphics.fillCircle(2, 2, 2);
    starGraphics.generateTexture('star', 4, 4);
    starGraphics.destroy();
  }

  create() {
    this._phaserMusicService = this.registry.get('musicService') as PhaserMusicService;
    this.scene.launch('UIOverlayScene', { showPauseButton: false, showName: true, readOnly: false });
    this._phaserMusicService.init(this);
    this._phaserMusicService.playMusic(MusicTrack.MainTheme);

    const { width, height } = this.scale;

    // Создаём космический бекграунд
    this.createSpaceBackground(width, height);

    // Создаём туманности
    this.createNebulae(width, height);

    // Создаём звёздное поле
    this.createStarfield(width, height);

    // Создаём астероидное поле
    this.createAsteroidField(width, height);

    // Создаём планеты в разных позициях
    this.createPlanets(width, height);

    // Создаём далёкие звёзды-спрайты
    this.createDistantStars(width, height);

    // Заголовок с эффектом свечения
    this.createTitle(width, height);

    // Кнопки меню с улучшенным дизайном
    this.createMenuButtons(width, height);
  }

  // createSpaceBackground(width: number, height: number) {
  //   // Простой тёмный фон вместо градиента (градиенты могут не работать в некоторых версиях Phaser)
  //   const graphics = this.add.graphics();
  //   graphics.fillStyle(0x0a0a2a, 1);
  //   graphics.fillRect(0, 0, width, height);
  // }
  //
  // createNebulae(width: number, height: number) {
  //   const colors = [
  //     { color: 0x441166, alpha: 0.3 },
  //     { color: 0x116644, alpha: 0.2 },
  //     { color: 0x661122, alpha: 0.25 },
  //     { color: 0x223366, alpha: 0.2 }
  //   ];
  //
  //   colors.forEach((nebula) => {
  //     const graphics = this.add.graphics();
  //     graphics.fillStyle(nebula.color, nebula.alpha);
  //
  //     // Создаём простую круглую туманность вместо сложной формы
  //     const centerX = width * (0.2 + Math.random() * 0.6);
  //     const centerY = height * (0.2 + Math.random() * 0.6);
  //     const radius = 150 + Math.random() * 200;
  //
  //     graphics.fillCircle(centerX, centerY, radius);
  //     this.nebulae.push(graphics);
  //   });
  // }

  createStarfield(width: number, height: number) {
    // Слой 1: Мелкие далёкие звёзды
    const stars1 = this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      quantity: 1,
      frequency: 200,
      lifespan: 10000,
      scale: { start: 0.1, end: 0.1 },
      alpha: { start: 0.3, end: 0.3 },
      speedX: { min: -10, max: 10 },
      speedY: { min: -10, max: 10 },
      blendMode: 'ADD'
    });

    // Слой 2: Средние звёзды
    const stars2 = this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      quantity: 1,
      frequency: 300,
      lifespan: 8000,
      scale: { start: 0.2, end: 0.2 },
      alpha: { start: 0.5, end: 0.5 },
      speedX: { min: -15, max: 15 },
      speedY: { min: -15, max: 15 },
      blendMode: 'ADD'
    });

    // Слой 3: Близкие яркие звёзды
    const stars3 = this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      quantity: 1,
      frequency: 400,
      lifespan: 5000,
      scale: { start: 0.3, end: 0.3 },
      alpha: { start: 0.8, end: 0.8 },
      speedX: { min: -20, max: 20 },
      speedY: { min: -20, max: 20 },
      blendMode: 'ADD'
    });

    this.stars.push(stars1, stars2, stars3);
  }

  createAsteroidField(width: number, height: number) {
    // Создаём несколько астероидных полей
    for (let i = 0; i < 3; i++) {
      const asteroidCount = 10 + Math.floor(Math.random() * 8);
      const fieldX = width * (0.1 + Math.random() * 0.8);
      const fieldY = height * (0.1 + Math.random() * 0.8);
      const fieldRadius = 80 + Math.random() * 120;

      for (let j = 0; j < asteroidCount; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * fieldRadius;
        const x = fieldX + Math.cos(angle) * distance;
        const y = fieldY + Math.sin(angle) * distance;

        const asteroid = this.add.graphics();
        const size = 2 + Math.random() * 4;

        const color = Phaser.Math.Between(0x333333, 0x666666);
        asteroid.fillStyle(color, 0.8 + Math.random() * 0.2);
        asteroid.fillRect(x, y, size, size);

        // Вращение астероидов
        this.tweens.add({
          targets: asteroid,
          rotation: Math.PI * 2,
          duration: 8000 + Math.random() * 15000,
          repeat: -1
        });
      }
    }
  }

  createPlanets(width: number, height: number) {
    // Создаём 4 планеты в разных углах экрана с правильными глубинами
    const planetPositions = [
      { x: width * 0.15, y: height * 0.25, scale: 0.7, depth: 5 },
      { x: width * 0.85, y: height * 0.35, scale: 0.9, depth: 4 },
      { x: width * 0.25, y: height * 0.75, scale: 0.6, depth: 6 },
      { x: width * 0.75, y: height * 0.65, scale: 1.1, depth: 3 }
    ];

    planetPositions.forEach((pos, index) => {
      const size = 60 + Math.random() * 80;
      const planet = this.generateBeautifulPlanet(size, size);
      planet.setPosition(pos.x, pos.y);
      planet.setScale(pos.scale);
      planet.setDepth(pos.depth); // Устанавливаем правильную глубину

      console.log(`Planet ${index} created at:`, pos.x, pos.y, 'scale:', pos.scale); // Для отладки

      // Вращение планет с разной скоростью
      this.tweens.add({
        targets: planet,
        angle: 360,
        duration: 80000 + Math.random() * 80000,
        repeat: -1
      });
    });
  }

  createSpaceBackground(width: number, height: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0a0a2a, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.setDepth(-10); // Фон должен быть самым задним
  }

  createNebulae(width: number, height: number) {
    const colors = [
      { color: 0x441166, alpha: 0.15 },
      { color: 0x116644, alpha: 0.1 },
      { color: 0x661122, alpha: 0.12 },
      { color: 0x223366, alpha: 0.1 }
    ];

    colors.forEach((nebula, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(nebula.color, nebula.alpha);

      const centerX = width * (0.1 + Math.random() * 0.8);
      const centerY = height * (0.1 + Math.random() * 0.8);
      const radius = 100 + Math.random() * 150;

      graphics.fillCircle(centerX, centerY, radius);
      graphics.setDepth(-5); // Туманности позади планет
      this.nebulae.push(graphics);
    });
  }

  generateBeautifulPlanet(width: number, height: number): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const radius = Math.min(width, height) / 2;

    // Выбираем красивые цветовые схемы для планет
    const planetTypes = [
      { base: 0x4a6fa5, dark: 0x2a4f7a, light: 0x6a8fc5, atmosphere: 0x88aadd }, // Голубая
      { base: 0xc46c4a, dark: 0xa44c2a, light: 0xe48c6a, atmosphere: 0xffaa88 }, // Оранжевая
      { base: 0x6a9f6a, dark: 0x4a7f4a, light: 0x8abf8a, atmosphere: 0xaaddaa }, // Зелёная
      { base: 0x9f6a9f, dark: 0x7f4a7f, light: 0xbf8abf, atmosphere: 0xddaadd }, // Фиолетовая
      { base: 0xa5a56f, dark: 0x7a7a4a, light: 0xc5c58f, atmosphere: 0xdddd88 }  // Жёлтая
    ];

    const planetType = planetTypes[Math.floor(Math.random() * planetTypes.length)];

    // Основная планета с градиентным эффектом
    const planetGraphics = this.add.graphics();

    // Рисуем основную планету
    planetGraphics.fillStyle(planetType.base);
    planetGraphics.fillCircle(0, 0, radius);

    // Добавляем детали поверхности
    const detailGraphics = this.add.graphics();

    // Создаём горные хребты и впадины
    for (let i = 0; i < 25; i++) {
      const detailType = Math.random();
      const detailRadius = Phaser.Math.Between(3, 12);
      const angle = Phaser.Math.Between(0, 360);
      const distance = Phaser.Math.Between(0, radius - detailRadius - 2);

      const x = Math.cos(Phaser.Math.DegToRad(angle)) * distance;
      const y = Math.sin(Phaser.Math.DegToRad(angle)) * distance;

      if (detailType < 0.3) {
        // Горы (светлые)
        detailGraphics.fillStyle(planetType.light, 0.7);
        detailGraphics.fillCircle(x, y, detailRadius);
      } else if (detailType < 0.6) {
        // Кратеры (тёмные)
        detailGraphics.fillStyle(planetType.dark, 0.6);
        detailGraphics.fillCircle(x, y, detailRadius);

        // Добавляем ободок кратера
        if (detailRadius > 6) {
          detailGraphics.lineStyle(1, planetType.light, 0.4);
          detailGraphics.strokeCircle(x, y, detailRadius);
        }
      } else {
        // Пятна поверхности
        detailGraphics.fillStyle(Math.random() > 0.5 ? planetType.light : planetType.dark, 0.4);
        detailGraphics.fillCircle(x, y, detailRadius);
      }
    }

    // Большие континентальные массы
    for (let i = 0; i < 4; i++) {
      const continentRadius = Phaser.Math.Between(15, 25);
      const angle = Phaser.Math.Between(0, 360);
      const distance = Phaser.Math.Between(radius * 0.3, radius - continentRadius - 5);

      const x = Math.cos(Phaser.Math.DegToRad(angle)) * distance;
      const y = Math.sin(Phaser.Math.DegToRad(angle)) * distance;

      detailGraphics.fillStyle(planetType.light, 0.3);
      detailGraphics.fillCircle(x, y, continentRadius);

      // Добавляем детали на континентах
      for (let j = 0; j < 3; j++) {
        const smallRadius = Phaser.Math.Between(2, 6);
        const smallX = x + Phaser.Math.Between(-10, 10);
        const smallY = y + Phaser.Math.Between(-10, 10);
        detailGraphics.fillStyle(planetType.dark, 0.5);
        detailGraphics.fillCircle(smallX, smallY, smallRadius);
      }
    }

    // Атмосфера с градиентом
    const atmosphere = this.add.graphics();
    for (let i = 1; i <= 3; i++) {
      const atmRadius = radius + i * 3;
      const alpha = 0.1 - (i * 0.02);
      atmosphere.fillStyle(planetType.atmosphere, alpha);
      atmosphere.fillCircle(0, 0, atmRadius);
    }

    // Динамические облака
    const clouds = this.add.graphics();
    const cloudCount = 8 + Math.floor(Math.random() * 6);

    for (let i = 0; i < cloudCount; i++) {
      const cloudRadius = Phaser.Math.Between(4, 10);
      const angle = Phaser.Math.Between(0, 360);
      const distance = Phaser.Math.Between(radius * 0.5, radius - 2);

      const x = Math.cos(Phaser.Math.DegToRad(angle)) * distance;
      const y = Math.sin(Phaser.Math.DegToRad(angle)) * distance;

      clouds.fillStyle(0xffffff, 0.15 + Math.random() * 0.1);
      clouds.fillCircle(x, y, cloudRadius);

      // Добавляем дополнительные части облаков
      if (Math.random() > 0.5) {
        clouds.fillCircle(x + cloudRadius * 0.8, y, cloudRadius * 0.7);
      }
      if (Math.random() > 0.7) {
        clouds.fillCircle(x, y + cloudRadius * 0.8, cloudRadius * 0.6);
      }
    }

    // Добавляем тень для объёма
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(radius * 0.3, radius * 0.3, radius * 1.4, radius * 1.2);

    // Собираем планету в правильном порядке
    container.add(planetGraphics);
    container.add(detailGraphics);
    container.add(shadow);
    container.add(atmosphere);
    container.add(clouds);

    // Анимация облаков
    this.tweens.add({
      targets: clouds,
      angle: 360,
      duration: 120000 + Math.random() * 60000,
      repeat: -1,
      ease: 'Linear'
    });

    return container;
  }

  createDistantStars(width: number, height: number) {
    // Создаём несколько ярких далёких звёзд-спрайтов
    for (let i = 0; i < 12; i++) {
      const star = this.add.graphics();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 1 + Math.random() * 2;
      const brightness = 0.3 + Math.random() * 0.7;

      star.fillStyle(0xffffff, brightness);
      star.fillCircle(x, y, size);

      // Мерцание звёзд
      this.tweens.add({
        targets: star,
        alpha: { from: brightness * 0.5, to: brightness },
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createTitle(width: number, height: number) {
    // Основной текст заголовка
    const title = this.add.text(width / 2, height * 0.15, 'KNIGHTS GAME', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#4488ff',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Свечение заголовка
    this.tweens.add({
      targets: title,
      alpha: { from: 0.8, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Подзаголовок
    this.add.text(width / 2, height * 0.22, 'КОСМИЧЕСКАЯ СТРЕЛЯЛКА', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#88aaff',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  createMenuButtons(width: number, height: number) {
    const buttonSpacing = 65;
    const startY = height * 0.4;
    const centerX = width / 2;

    const buttons = [
      { text: '🚀 НАЧАТЬ ИГРУ', callback: () => this.scene.start('main') },
      { text: '🎮 СОЗДАТЬ ИГРУ', callback: () => this.scene.start('CreateLobbyScene') },
      { text: '🔗 ПРИСОЕДИНИТЬСЯ', callback: () => this.scene.start('JoinLobbyScene') },
      { text: '⚙️ НАСТРОЙКИ', callback: () => this.scene.start('SettingsScene') },
      { text: '❓ ОБУЧЕНИЕ', callback: () => this.scene.start('TutorialScene') }
    ];

    buttons.forEach((buttonInfo, index) => {
      const button = this.add.text(centerX, startY + buttonSpacing * index, buttonInfo.text, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#1a1a3a',
        padding: { x: 20, y: 12 },
        //borderRadius: 8
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Эффекты кнопок
      button.on('pointerover', () => {
        button.setStyle({
          backgroundColor: '#2a2a5a',
          color: '#88ccff'
        });
        this.tweens.add({
          targets: button,
          scale: { from: 1, to: 1.05 },
          duration: 150,
          ease: 'Back.easeOut'
        });
      });

      button.on('pointerout', () => {
        button.setStyle({
          backgroundColor: '#1a1a3a',
          color: '#ffffff'
        });
        this.tweens.add({
          targets: button,
          scale: { from: 1.05, to: 1 },
          duration: 150
        });
      });

      button.on('pointerdown', () => {
        this.tweens.add({
          targets: button,
          scale: { from: 1.05, to: 0.95 },
          duration: 100,
          yoyo: true,
          onComplete: buttonInfo.callback
        });
      });
    });
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

    // Рисуем основную планету
    const radius = Math.min(width, height) / 2;

    // Основной круг планеты
    planetGraphics.fillStyle(baseColor.color);
    planetGraphics.fillCircle(0, 0, radius);

    // Добавляем текстуру кратеров и деталей
    const detailGraphics = this.add.graphics();

    // Создаём кратеры и детали поверхности
    for (let i = 0; i < 12; i++) {
      const craterRadius = Phaser.Math.Between(4, 15);
      const angle = Phaser.Math.Between(0, 360);
      const distance = Phaser.Math.Between(0, radius - craterRadius - 5);

      const x = Math.cos(Phaser.Math.DegToRad(angle)) * distance;
      const y = Math.sin(Phaser.Math.DegToRad(angle)) * distance;

      // Чередуем тёмные и светлые кратеры для текстуры
      if (Math.random() > 0.5) {
        detailGraphics.fillStyle(darkColor, 0.6);
      } else {
        detailGraphics.fillStyle(lightColor, 0.4);
      }

      detailGraphics.fillCircle(x, y, craterRadius);
    }

    // Добавляем большие континентальные массы
    for (let i = 0; i < 2; i++) {
      const continentRadius = Phaser.Math.Between(12, 25);
      const angle = Phaser.Math.Between(0, 360);
      const distance = Phaser.Math.Between(0, radius - continentRadius - 8);

      const x = Math.cos(Phaser.Math.DegToRad(angle)) * distance;
      const y = Math.sin(Phaser.Math.DegToRad(angle)) * distance;

      detailGraphics.fillStyle(lightColor, 0.3);
      detailGraphics.fillCircle(x, y, continentRadius);
    }

    // Атмосфера
    const atmosphere = this.add.graphics();
    atmosphere.fillStyle(0x88ccff, 0.15);
    atmosphere.fillCircle(0, 0, radius + 6);

    // Облака
    const clouds = this.add.graphics();
    clouds.fillStyle(0xffffff, 0.1);

    for (let i = 0; i < 6; i++) {
      const cloudRadius = Phaser.Math.Between(6, 12);
      const angle = Phaser.Math.Between(0, 360);
      const distance = Phaser.Math.Between(radius * 0.6, radius - 3);

      const x = Math.cos(Phaser.Math.DegToRad(angle)) * distance;
      const y = Math.sin(Phaser.Math.DegToRad(angle)) * distance;

      clouds.fillCircle(x, y, cloudRadius);
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
      duration: 120000,
      repeat: -1
    });

    return container;
  }
}
