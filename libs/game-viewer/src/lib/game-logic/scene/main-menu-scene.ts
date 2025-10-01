import {MusicTrack, PhaserMusicService, SoundsTrack} from '../../services/phaser-music-service/phaser-music-service';
import * as Phaser from 'phaser';

enum PlanetType {
  EARTH = 'earth',
  GAS = 'gas',
  LAVA = 'lava',
  ICE = 'ice'
}

interface PlanetScheme {
  base: number;
  dark: number;
  light: number;
  accent: number;
}

export class MainMenuScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private playerNameInput!: any;
  private stars: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private nebulae: Phaser.GameObjects.Graphics[] = [];
  private planets: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    this._phaserMusicService = this.registry.get('musicService') as PhaserMusicService;
    this.scene.launch('UIOverlayScene', { showPauseButton: false, showName: true, readOnly: false });
    this._phaserMusicService.init(this);
    this._phaserMusicService.playMusic(MusicTrack.MainTheme);

    const { width, height } = this.scale;

    this.createSpaceBackground(width, height);
    this.createNebulae(width, height);
    this.createStarfield(width, height);
    this.createAsteroidField(width, height);
    this.createPlanets(width, height);
    this.createDistantStars(width, height);

    this.createTitle(width, height);
    this.createMenuButtons(width, height);
  }

  createSpaceBackground(width: number, height: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0a0a1a, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.setDepth(-100);
  }

  createNebulae(width: number, height: number) {
    const nebulaData = [
      { x: 0.2, y: 0.3, color: 0x331155, alpha: 0.08, scale: 1.2 },
      { x: 0.8, y: 0.7, color: 0x115533, alpha: 0.06, scale: 1.0 },
      { x: 0.4, y: 0.8, color: 0x551122, alpha: 0.07, scale: 0.9 },
      { x: 0.7, y: 0.2, color: 0x223355, alpha: 0.05, scale: 1.1 }
    ];

    nebulaData.forEach((data, index) => {
      const graphics = this.add.graphics();
      const centerX = width * data.x;
      const centerY = height * data.y;
      const radius = 120 * data.scale;

      // Создаём более мягкую туманность
      for (let i = 0; i < 3; i++) {
        const currentRadius = radius * (0.6 + i * 0.2);
        const currentAlpha = data.alpha * (0.8 - i * 0.2);
        graphics.fillStyle(data.color, currentAlpha);
        graphics.fillCircle(centerX, centerY, currentRadius);
      }

      graphics.setDepth(-90);
      this.nebulae.push(graphics);
    });
  }

  createStarfield(width: number, height: number) {
    const smallStars = this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      quantity: 1,
      frequency: 150,
      lifespan: 15000,
      scale: { start: 0.08, end: 0.08 },
      alpha: { start: 0.4, end: 0.4 },
      speedX: { min: -5, max: 5 },
      speedY: { min: -5, max: 5 },
      blendMode: 'ADD'
    });
    smallStars.setDepth(-80);

    const averageStars = this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      quantity: 1,
      frequency: 200,
      lifespan: 10000,
      scale: { start: 0.15, end: 0.15 },
      alpha: { start: 0.6, end: 0.6 },
      speedX: { min: -8, max: 8 },
      speedY: { min: -8, max: 8 },
      blendMode: 'ADD'
    });
    averageStars.setDepth(-70);

    this.stars.push(smallStars, averageStars);
  }

  createAsteroidField(width: number, height: number) {
    for (let i = 0; i < 2; i++) {
      const asteroidCount = 8;
      const fieldX = width * (0.2 + Math.random() * 0.6);
      const fieldY = height * (0.2 + Math.random() * 0.6);
      const fieldRadius = 60 + Math.random() * 80;

      for (let j = 0; j < asteroidCount; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * fieldRadius;
        const x = fieldX + Math.cos(angle) * distance;
        const y = fieldY + Math.sin(angle) * distance;

        const asteroid = this.add.graphics();
        const size = 1 + Math.random() * 3;

        const color = Phaser.Math.Between(0x444444, 0x777777);
        asteroid.fillStyle(color, 0.9);

        // Рисуем астероид в виде неправильного многоугольника
        asteroid.fillPoints([
          { x: x, y: y },
          { x: x + size, y: y },
          { x: x + size * 0.8, y: y + size },
          { x: x, y: y + size * 0.7 }
        ]);

        asteroid.setDepth(-60);

        this.tweens.add({
          targets: asteroid,
          rotation: Math.PI * 2,
          duration: 12000 + Math.random() * 12000,
          repeat: -1
        });
      }
    }
  }

  createPlanets(width: number, height: number) {
    // Планеты с красивым расположением
    const planetData: Array<{x: number, y: number, scale: number, type: PlanetType}> = [
      { x: width * 0.15, y: height * 0.2, scale: 0.6, type: PlanetType.GAS },
      { x: width * 0.85, y: height * 0.25, scale: 0.8, type: PlanetType.EARTH },
      { x: width * 0.2, y: height * 0.75, scale: 0.5, type: PlanetType.LAVA },
      { x: width * 0.78, y: height * 0.7, scale: 0.7, type: PlanetType.ICE }
    ];

    planetData.forEach((data, index) => {
      const size = 50 + Math.random() * 40;
      const planet = this.generatePlanet(size, size, data.type);
      planet.setPosition(data.x, data.y);
      planet.setScale(data.scale);
      planet.setDepth(-50 + index); // Разная глубина для планет

      // Плавное вращение
      this.tweens.add({
        targets: planet,
        angle: 360,
        duration: 90000 + Math.random() * 60000,
        repeat: -1,
        ease: 'Linear'
      });

      this.planets.push(planet);
    });
  }

  generatePlanet(width: number, height: number, type: PlanetType): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const radius = Math.min(width, height) / 2;

    // Цветовые схемы для разных типов планет
    const planetSchemes: Record<PlanetType, PlanetScheme> = {
      earth: { base: 0x4a7f5a, dark: 0x2a5f3a, light: 0x6a9f7a, accent: 0x8abf8a },
      gas: { base: 0x9f8a4a, dark: 0x7f6a2a, light: 0xbfaa6a, accent: 0xdfca8a },
      lava: { base: 0xbf5a3a, dark: 0x9f3a1a, light: 0xdf7a5a, accent: 0xff9a7a },
      ice: { base: 0x7a9fbf, dark: 0x5a7f9f, light: 0x9abfdf, accent: 0xbadfff }
    };

    const scheme = planetSchemes[type] || planetSchemes.earth;

    // Основная планета
    const planetMain = this.add.graphics();
    planetMain.fillStyle(scheme.base);
    planetMain.fillCircle(0, 0, radius);

    // Детали поверхности
    const surfaceDetails = this.add.graphics();

    // Создаём текстуру поверхности
    for (let i = 0; i < 20; i++) {
      const detailSize = Phaser.Math.Between(2, 8);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (radius - detailSize - 2);

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      if (Math.random() > 0.5) {
        surfaceDetails.fillStyle(scheme.light, 0.6);
      } else {
        surfaceDetails.fillStyle(scheme.dark, 0.6);
      }

      surfaceDetails.fillCircle(x, y, detailSize);
    }

    // Большие особенности поверхности
    for (let i = 0; i < 3; i++) {
      const featureSize = Phaser.Math.Between(10, 18);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (radius - featureSize - 5);

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      surfaceDetails.fillStyle(scheme.accent, 0.4);
      surfaceDetails.fillCircle(x, y, featureSize);
    }

    // Атмосфера с мягким градиентом
    const atmosphere = this.add.graphics();
    for (let i = 1; i <= 2; i++) {
      const atmRadius = radius + i * 4;
      const alpha = 0.08 - (i * 0.03);
      atmosphere.fillStyle(scheme.light, alpha);
      atmosphere.fillCircle(0, 0, atmRadius);
    }

    // Облака только для землеподобных планет
    if (type === 'earth' || type === 'gas') {
      const clouds = this.add.graphics();
      const cloudCount = type === 'gas' ? 12 : 6;

      for (let i = 0; i < cloudCount; i++) {
        const cloudSize = Phaser.Math.Between(3, 7);
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (radius * 0.8);

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        clouds.fillStyle(0xffffff, 0.1 + Math.random() * 0.1);
        clouds.fillCircle(x, y, cloudSize);
      }

      // Анимация облаков
      this.tweens.add({
        targets: clouds,
        angle: type === 'gas' ? 720 : 360,
        duration: type === 'gas' ? 60000 : 120000,
        repeat: -1,
        ease: 'Linear'
      });

      container.add(clouds);
    }

    container.add(planetMain);
    container.add(surfaceDetails);
    container.add(atmosphere);

    return container;
  }

  createDistantStars(width: number, height: number) {
    // Создаём мерцающие далёкие звёзды
    for (let i = 0; i < 15; i++) {
      const star = this.add.graphics();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 0.5 + Math.random() * 1.5;
      const brightness = 0.2 + Math.random() * 0.8;

      star.fillStyle(0xffffff, brightness);
      star.fillCircle(x, y, size);
      star.setDepth(-40);

      // Мерцание
      this.tweens.add({
        targets: star,
        alpha: brightness * 0.3,
        duration: 800 + Math.random() * 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createTitle(width: number, height: number) {
    // Заголовок с тенью
    const titleShadow = this.add.text(width / 2 + 2, height * 0.15 + 2, 'KNIGHTS GAME', {
      fontSize: '62px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0.3);

    const title = this.add.text(width / 2, height * 0.15, 'KNIGHTS GAME', {
      fontSize: '62px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#4488ff',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Подзаголовок
    const subtitle = this.add.text(width / 2, height * 0.22, 'КОСМИЧЕСКАЯ СТРЕЛЯЛКА', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaccff',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Свечение заголовка
    this.tweens.add({
      targets: [title, subtitle],
      alpha: { from: 0.9, to: 1 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createMenuButtons(width: number, height: number) {
    const buttonSpacing = 65;
    const startY = height * 0.35;
    const centerX = width / 2;

    const buttons = [
      { text: 'ЗАПУСК СИСТЕМ', callback: () => this.scene.start('main'), color: 0x00ff88, icon: '▶' },
      { text: 'СОЗДАТЬ МИССИЮ', callback: () => this.scene.start('CreateLobbyScene'), color: 0x0088ff, icon: '⚙' },
      { text: 'ПОДКЛЮЧИТЬСЯ', callback: () => this.scene.start('JoinLobbyScene'), color: 0x8844ff, icon: '⛓' },
      { text: 'КОНФИГУРАЦИЯ', callback: () => this.scene.start('SettingsScene'), color: 0xffaa00, icon: '🛠' },
      { text: 'БОРТОВОЙ ЖУРНАЛ', callback: () => this.scene.start('TutorialScene'), color: 0xff4444, icon: '✎' }
    ];

    // Сначала создадим все текстовые элементы, чтобы выровнять их
    const textMetrics: { width: number, text: Phaser.GameObjects.Text }[] = [];

    buttons.forEach((buttonInfo, index) => {
      const tempText = this.add.text(0, 0, buttonInfo.text, {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ccddee',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      textMetrics.push({ width: tempText.width, text: tempText });
      tempText.destroy();
    });

    // Находим максимальную ширину текста
    const maxTextWidth = Math.max(...textMetrics.map(m => m.width));
    const totalButtonWidth = maxTextWidth + 140; // + место для иконки и отступов

    buttons.forEach((buttonInfo, index) => {
      const buttonGroup = this.add.container(centerX, startY + buttonSpacing * index);
      const buttonHeight = 50;
      const buttonWidth = totalButtonWidth;

      // Основная панель кнопки
      const mainPanel = this.add.graphics();
      mainPanel.fillStyle(0x0a1a2a, 0.9);
      mainPanel.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
      mainPanel.lineStyle(2, 0x223344, 1);
      mainPanel.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);

      // Активная зона сенсора
      const sensorZone = this.add.graphics();
      sensorZone.fillStyle(0x112233, 0.6);
      sensorZone.fillRoundedRect(-buttonWidth/2 + 5, -buttonHeight/2 + 5, buttonWidth - 10, buttonHeight - 10, 5);
      sensorZone.lineStyle(1, buttonInfo.color, 0.3);
      sensorZone.strokeRoundedRect(-buttonWidth/2 + 5, -buttonHeight/2 + 5, buttonWidth - 10, buttonHeight - 10, 5);

      // Неоновое свечение (изначально невидимое)
      const glowEffect = this.add.graphics();
      glowEffect.fillStyle(buttonInfo.color, 0);
      glowEffect.fillRoundedRect(-buttonWidth/2 - 2, -buttonHeight/2 - 2, buttonWidth + 4, buttonHeight + 4, 10);
      glowEffect.lineStyle(3, buttonInfo.color, 0);
      glowEffect.strokeRoundedRect(-buttonWidth/2 - 2, -buttonHeight/2 - 2, buttonWidth + 4, buttonHeight + 4, 10);

      // Электрические разряды по краям
      const electricityLeft = this.add.graphics();
      const electricityRight = this.add.graphics();

      const iconText = this.add.text(-buttonWidth/2 + 25, 0, buttonInfo.icon, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const buttonText = this.add.text(-buttonWidth/2 + 50, 0, buttonInfo.text, {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ccddee',
        fontStyle: 'bold',
        align: 'left'
      }).setOrigin(0, 0.5);

      // Индикатор готовности
      const readyIndicator = this.add.graphics();
      readyIndicator.fillStyle(buttonInfo.color, 0.8);
      readyIndicator.fillCircle(buttonWidth/2 - 15, 0, 4);

      // Собираем кнопку
      buttonGroup.add([mainPanel, sensorZone, glowEffect, electricityLeft, electricityRight, iconText, buttonText, readyIndicator]);
      buttonGroup.setSize(buttonWidth, buttonHeight);
      buttonGroup.setInteractive();

      // Переменные для управления анимациями
      let isHovered = false;
      let electricAnimation: Phaser.Tweens.Tween;

      // Анимация готовности индикатора
      this.tweens.add({
        targets: readyIndicator,
        alpha: { from: 0.3, to: 0.8 },
        duration: 1000 + index * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Функция для создания непрерывного электрического эффекта
      const startElectricEffect = () => {
        if (electricAnimation) {
          electricAnimation.stop();
        }

        const updateElectricity = () => {
          electricityLeft.clear();
          electricityRight.clear();
          this.createElectricEffect(electricityLeft, -buttonWidth/2, -buttonHeight/2, buttonHeight, buttonInfo.color, true);
          this.createElectricEffect(electricityRight, buttonWidth/2, -buttonHeight/2, buttonHeight, buttonInfo.color, false);
        };

        // Запускаем обновление каждые 150ms пока кнопка в hover состоянии
        electricAnimation = this.tweens.add({
          targets: { value: 0 },
          value: 1,
          duration: 150,
          repeat: -1,
          onRepeat: updateElectricity
        });

        updateElectricity(); // Первый вызов
      };

      // Функция остановки электрического эффекта
      const stopElectricEffect = () => {
        if (electricAnimation) {
          electricAnimation.stop();
          electricAnimation.remove();
        }
        electricityLeft.clear();
        electricityRight.clear();
      };

      // ЭФФЕКТ ПРИ НАВЕДЕНИИ
      buttonGroup.on('pointerover', () => {
        isHovered = true;

        // Активация неонового свечения
        this.tweens.add({
          targets: glowEffect,
          alpha: { from: 0, to: 0.4 },
          duration: 200,
          ease: 'Power2'
        });

        // Усиление свечения сенсорной зоны
        this.tweens.add({
          targets: sensorZone,
          alpha: { from: 0.6, to: 0.8 },
          duration: 200
        });

        // Анимация текста и иконки
        this.tweens.add({
          targets: [buttonText, iconText],
          scale: { from: 1, to: 1.05 },
          duration: 150,
          ease: 'Back.easeOut'
        });

        buttonText.setColor('#ffffff');
        iconText.setColor(Phaser.Display.Color.IntegerToColor(buttonInfo.color).rgba);

        // Запуск непрерывного электрического эффекта
        startElectricEffect();

        this._phaserMusicService.playSound(SoundsTrack.InterfaceHover);
      });

      // ЭФФЕКТ ПРИ УХОДЕ КУРСОРА
      buttonGroup.on('pointerout', () => {
        isHovered = false;

        // Выключение неонового свечения
        this.tweens.add({
          targets: glowEffect,
          alpha: { from: 0.4, to: 0 },
          duration: 300,
          ease: 'Power2'
        });

        // Возврат сенсорной зоны
        this.tweens.add({
          targets: sensorZone,
          alpha: { from: 0.8, to: 0.6 },
          duration: 200
        });

        // Возврат текста и иконки
        this.tweens.add({
          targets: [buttonText, iconText],
          scale: { from: 1.05, to: 1 },
          duration: 150
        });

        buttonText.setColor('#ccddee');
        iconText.setColor('#ffffff');

        // Остановка электрических эффектов
        stopElectricEffect();
      });

      // ЭФФЕКТ НАЖАТИЯ
      buttonGroup.on('pointerdown', () => {
        // Импульс при нажатии
        this.tweens.add({
          targets: [glowEffect, sensorZone],
          alpha: { from: isHovered ? 0.4 : 0, to: 0.8 },
          duration: 100,
          yoyo: true
        });

        // Анимация нажатия
        this.tweens.add({
          targets: buttonGroup,
          scale: { from: 1, to: 0.95 },
          duration: 80,
          yoyo: true,
          onComplete: buttonInfo.callback
        });

        // Яркая вспышка
        const flash = this.add.graphics();
        flash.fillStyle(buttonInfo.color, 0.6);
        flash.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
        buttonGroup.add(flash);

        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 200,
          onComplete: () => flash.destroy()
        });

        this._phaserMusicService.playSound(SoundsTrack.InterfaceClick);
      });

      // Анимация плавающего эффекта для всех кнопок
      this.tweens.add({
        targets: buttonGroup,
        y: `+=${Phaser.Math.Between(-1, 1)}`,
        duration: 3000 + index * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  createElectricEffect(graphics: Phaser.GameObjects.Graphics, x: number, y: number, height: number, color: number, isLeft: boolean) {
    const points: number[] = [];
    const segmentHeight = height / 6;

    // Начальная точка
    points.push(x, y);

    // Создаём зигзагообразную линию с меньшим количеством сегментов
    for (let i = 1; i < 6; i++) {
      const currentY = y + i * segmentHeight;
      const offset = isLeft ? -Phaser.Math.Between(2, 6) : Phaser.Math.Between(2, 6);
      points.push(x + offset, currentY);
    }

    // Конечная точка
    points.push(x, y + height);

    // Рисуем электрическую дугу
    graphics.lineStyle(1.2, color, 0.7);
    graphics.beginPath();
    graphics.moveTo(points[0], points[1]);

    for (let i = 2; i < points.length; i += 2) {
      graphics.lineTo(points[i], points[i + 1]);
    }

    graphics.strokePath();

    // Добавляем случайные точки-искры
    for (let i = 2; i < points.length - 2; i += 2) {
      if (Math.random() > 0.7) {
        graphics.fillStyle(color, 0.9);
        graphics.fillCircle(points[i], points[i + 1], 0.8);
      }
    }
  }
}
