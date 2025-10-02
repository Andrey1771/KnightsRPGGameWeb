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
  private asteroids: Phaser.GameObjects.Graphics[] = [];
  private explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private asteroidUpdateEvent?: Phaser.Time.TimerEvent;
  private asteroidsToRemove: number[] = [];
  private asteroidsToAdd: Phaser.GameObjects.Graphics[] = [];
  private staticStars: Phaser.GameObjects.Graphics[] = [];
  private comets: Phaser.GameObjects.Container[] = [];
  private spaceDust: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

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
    this.createStaticStarfield(width, height);
    this.createSpaceDust(width, height);
    this.createExplosionEmitter();
    this.createPlanets(width, height);
    this.createAsteroidField(width, height);
    this.createDistantStars(width, height);
    this.createComets(width, height);

    this.createTitle(width, height);
    this.createMenuButtons(width, height);
  }

  // Создаём кометы с хвостом
  createComets(width: number, height: number) {
    console.log('Creating comets...');

    // Создаём 2-3 кометы
    const cometCount = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < cometCount; i++) {
      this.createSimpleComet(width, height);
    }

    // Запускаем создание новых комет
    this.time.addEvent({
      delay: 10000 + Math.random() * 5000,
      callback: () => this.createSimpleComet(width, height),
      callbackScope: this,
      loop: true
    });
  }

  createSmoothCometTexture(key: string) {
    const size = 32; // Размер текстуры

    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    // Создаем мягкое круглое ядро
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(size / 2, size / 4, 3);

    // Создаем хвост в форме капли
    for (let i = 0; i < size * 0.75; i++) {
      const progress = i / (size * 0.75);
      const alpha = 0.8 * (1 - progress);
      const currentWidth = 8 * (1 - progress * 0.7);

      const r = Math.floor(255 * (1 - progress * 0.3));
      const g = Math.floor(255 * (1 - progress * 0.5));
      const b = 255;
      const color = Phaser.Display.Color.GetColor(r, g, b);

      graphics.fillStyle(color, alpha);
      graphics.fillRect(
        (size - currentWidth) / 2,
        size / 4 + i,
        currentWidth,
        1.2
      );
    }

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

// Метод создания кометы без лишних деталей
  createSimpleComet(sceneWidth?: number, sceneHeight?: number) {
    const width = sceneWidth || this.scale.width;
    const height = sceneHeight || this.scale.height;

    // Используйте альтернативную текстуру для более плавной кометы
    const cometKey = 'comet_smooth_' + Date.now() + Math.random();
    this.createSmoothCometTexture(cometKey); // ← ЗАМЕНИТЕ НА ЭТОТ ВЫЗОВ

    // Остальной код метода остается без изменений...
    const side = Math.floor(Math.random() * 4);
    let startX = 0, startY = 0, endX = 0, endY = 0;

    switch (side) {
      case 0: // Верх → Низ
        startX = Math.random() * width;
        startY = -30;
        endX = startX + (Math.random() - 0.5) * 300;
        endY = height + 30;
        break;
      case 1: // Право → Лево
        startX = width + 30;
        startY = Math.random() * height;
        endX = -30;
        endY = startY + (Math.random() - 0.5) * 300;
        break;
      case 2: // Низ → Верх
        startX = Math.random() * width;
        startY = height + 30;
        endX = startX + (Math.random() - 0.5) * 300;
        endY = -30;
        break;
      case 3: // Лево → Право
        startX = -30;
        startY = Math.random() * height;
        endX = width + 30;
        endY = startY + (Math.random() - 0.5) * 300;
        break;
    }

    const cometContainer = this.add.container(startX, startY);
    cometContainer.setDepth(-55);

    // Создаём спрайт кометы
    const cometSprite = this.add.sprite(0, 0, cometKey);
    cometContainer.add(cometSprite);

    // Вычисляем угол поворота
    const velocityX = endX - startX;
    const velocityY = endY - startY;
    const angle = Math.atan2(velocityY, velocityX);
    cometSprite.setRotation(angle + Math.PI / 2);

    // Эмиттер частиц для хвоста
    const tailEmitter = this.add.particles(0, 0, 'star', {
      follow: cometContainer,
      x: 0,
      y: 0,
      lifespan: 600,
      speed: { min: 15, max: 40 },
      angle: { min: angle * (180 / Math.PI) - 8, max: angle * (180 / Math.PI) + 8 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      quantity: 4,
      frequency: 40,
      blendMode: 'ADD',
      tint: [0x88aaff, 0xaaccff, 0x4466ff]
    });

    tailEmitter.setDepth(-56);

    // Движение кометы
    this.tweens.add({
      targets: cometContainer,
      x: endX,
      y: endY,
      duration: 3500 + Math.random() * 2000,
      ease: 'Linear',
      onComplete: () => {
        cometContainer.destroy();
        tailEmitter.destroy();
        const index = this.comets.indexOf(cometContainer);
        if (index > -1) {
          this.comets.splice(index, 1);
        }
      }
    });

    this.comets.push(cometContainer);
    return cometContainer;
  }

  // Создаём плотное поле статичных звёзд
  createStaticStarfield(width: number, height: number) {
    console.log('Creating static starfield...');

    // Создаём 200 статичных звёзд разного размера и яркости
    for (let i = 0; i < 200; i++) {
      const star = this.add.graphics();
      const x = Math.random() * width;
      const y = Math.random() * height;

      // Разные размеры звёзд
      const size = Math.random() * 2;
      const brightness = 0.3 + Math.random() * 0.7;

      // Разные цвета звёзд (белый, голубоватый, желтоватый)
      const colors = [0xffffff, 0xeeeeff, 0xffffee, 0xffffee];
      const color = colors[Math.floor(Math.random() * colors.length)];

      star.fillStyle(color, brightness);
      star.fillCircle(x, y, size);
      star.setDepth(-85); // Между туманностями и движущимися звёздами

      this.staticStars.push(star);
    }

    console.log(`Created ${this.staticStars.length} static stars`);
  }

  // Создаём космическую пыль
  createSpaceDust(width: number, height: number) {
    console.log('Creating space dust...');

    // Мелкая космическая пыль
    const dust1 = this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      quantity: 2,
      frequency: 100,
      lifespan: 20000,
      scale: { start: 0.02, end: 0.02 },
      alpha: { start: 0.1, end: 0.1 },
      speedX: { min: -1, max: 1 },
      speedY: { min: -1, max: 1 },
      blendMode: 'ADD',
      tint: 0x4466aa
    });
    dust1.setDepth(-95);

    // Средняя космическая пыль
    const dust2 = this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      quantity: 1,
      frequency: 150,
      lifespan: 15000,
      scale: { start: 0.04, end: 0.04 },
      alpha: { start: 0.15, end: 0.15 },
      speedX: { min: -0.5, max: 0.5 },
      speedY: { min: -0.5, max: 0.5 },
      blendMode: 'ADD',
      tint: 0x6688cc
    });
    dust2.setDepth(-94);

    this.spaceDust.push(dust1, dust2);
  }

  createDistantStars(width: number, height: number) {
    console.log('Creating distant stars...');

    // Увеличим количество мерцающих звёзд
    for (let i = 0; i < 25; i++) {
      const star = this.add.graphics();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 0.8 + Math.random() * 2; // Увеличим размер
      const brightness = 0.3 + Math.random() * 0.7;

      // Разноцветные мерцающие звёзды
      const colors = [0xffffff, 0xffffaa, 0xaaffff, 0xffaaff];
      const color = colors[Math.floor(Math.random() * colors.length)];

      star.fillStyle(color, brightness);
      star.fillCircle(x, y, size);
      star.setDepth(-45); // Перед планетами

      // Более разнообразное мерцание
      const minAlpha = brightness * 0.4;
      const maxAlpha = brightness;
      const duration = 1000 + Math.random() * 2000;

      this.tweens.add({
        targets: star,
        alpha: { from: minAlpha, to: maxAlpha },
        duration: duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 2000
      });

      // Добавляем лёгкое движение для некоторых звёзд
      if (Math.random() > 0.7) {
        this.tweens.add({
          targets: star,
          x: x + Phaser.Math.Between(-5, 5),
          y: y + Phaser.Math.Between(-5, 5),
          duration: 15000 + Math.random() * 10000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  // УЛУЧШИМ метод создания туманностей
  createNebulae(width: number, height: number) {
    const nebulaData = [
      { x: 0.2, y: 0.3, color: 0x331155, alpha: 0.12, scale: 1.2 }, // Увеличим альфу
      { x: 0.8, y: 0.7, color: 0x115533, alpha: 0.10, scale: 1.0 },
      { x: 0.4, y: 0.8, color: 0x551122, alpha: 0.11, scale: 0.9 },
      { x: 0.7, y: 0.2, color: 0x223355, alpha: 0.09, scale: 1.1 },
      // Добавим дополнительные туманности
      { x: 0.1, y: 0.7, color: 0x553366, alpha: 0.08, scale: 0.8 },
      { x: 0.9, y: 0.1, color: 0x336655, alpha: 0.07, scale: 1.3 }
    ];

    nebulaData.forEach((data, index) => {
      const graphics = this.add.graphics();
      const centerX = width * data.x;
      const centerY = height * data.y;
      const radius = 120 * data.scale;

      // Создаём более мягкую туманность с большим количеством слоёв
      for (let i = 0; i < 4; i++) {
        const currentRadius = radius * (0.5 + i * 0.25);
        const currentAlpha = data.alpha * (0.9 - i * 0.2);
        graphics.fillStyle(data.color, currentAlpha);
        graphics.fillCircle(centerX, centerY, currentRadius);
      }

      graphics.setDepth(-90);

      // Добавляем лёгкую анимацию пульсации для некоторых туманностей
      if (Math.random() > 0.5) {
        this.tweens.add({
          targets: graphics,
          alpha: { from: data.alpha * 0.8, to: data.alpha },
          duration: 8000 + Math.random() * 4000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      this.nebulae.push(graphics);
    });
  }

  createExplosionEmitter() {
    // Создаём эмиттер для взрывов
    this.explosionEmitter = this.add.particles(0, 0, 'star', {
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 10,
      frequency: -1, // Только по вызову
      blendMode: 'ADD',
      tint: [0xff4400, 0xff8844, 0xffff00]
    });
    this.explosionEmitter.setDepth(-40);
  }

  // ЗАМЕНИТЕ метод createAsteroidField на этот:
  createAsteroidField(width: number, height: number) {
    console.log('Creating asteroid fields...');

    // Создаём начальные астероиды в случайных позициях по всему пространству
    for (let i = 0; i < 15; i++) {
      const asteroid = this.createAsteroidInSpace(width, height);
      this.asteroids.push(asteroid);
    }

    console.log(`Created ${this.asteroids.length} initial asteroids`);

    // Запускаем обновление движения
    this.asteroidUpdateEvent = this.time.addEvent({
      delay: 16,
      callback: this.updateAsteroids,
      callbackScope: this,
      loop: true
    });
  }

// ЗАМЕНИТЕ метод createAsteroid на этот:
  createAsteroidInSpace(sceneWidth?: number, sceneHeight?: number): Phaser.GameObjects.Graphics {
    const width = sceneWidth || this.scale.width;
    const height = sceneHeight || this.scale.height;

    const asteroid = this.add.graphics();
    const size = 3 + Math.random() * 4;

    const colorVariants = [0x555555, 0x666666, 0x777777];
    const color = colorVariants[Math.floor(Math.random() * colorVariants.length)];

    // Создаём форму астероида
    const points = this.generateAsteroidShape(0, 0, size);
    asteroid.fillStyle(color, 0.9);
    asteroid.fillPoints(points, true);
    asteroid.lineStyle(1, 0x444444, 0.6);
    asteroid.strokePoints(points, true);

    // Случайная позиция ВНУТРИ пространства (не на краях)
    const x = Math.random() * width;
    const y = Math.random() * height;

    // Случайное направление движения
    const speed = 0.3 + Math.random() * 0.4; // Медленнее для более естественного вида
    const angle = Math.random() * Math.PI * 2;

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    asteroid.setPosition(x, y);
    asteroid.setDepth(-60);

    // Простые данные астероида
    (asteroid as any).asteroidData = {
      size: size,
      velocity: { x: vx, y: vy },
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      currentRotation: 0
    };

    return asteroid;
  }

// ДОБАВЬТЕ этот метод для создания новых астероидов на краях (когда старые улетают):
  createAsteroidAtEdge(sceneWidth?: number, sceneHeight?: number): Phaser.GameObjects.Graphics {
    const width = sceneWidth || this.scale.width;
    const height = sceneHeight || this.scale.height;

    const asteroid = this.add.graphics();
    const size = 3 + Math.random() * 4;

    const colorVariants = [0x555555, 0x666666, 0x777777];
    const color = colorVariants[Math.floor(Math.random() * colorVariants.length)];

    // Создаём форму астероида
    const points = this.generateAsteroidShape(0, 0, size);
    asteroid.fillStyle(color, 0.9);
    asteroid.fillPoints(points, true);
    asteroid.lineStyle(1, 0x444444, 0.6);
    asteroid.strokePoints(points, true);

    // Начальная позиция на краю экрана (для новых астероидов)
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;

    switch (side) {
      case 0: // Верх
        x = Math.random() * width;
        y = -10;
        vx = (Math.random() - 0.5) * 0.8;
        vy = 0.5 + Math.random() * 0.3;
        break;
      case 1: // Право
        x = width + 10;
        y = Math.random() * height;
        vx = -0.5 - Math.random() * 0.3;
        vy = (Math.random() - 0.5) * 0.8;
        break;
      case 2: // Низ
        x = Math.random() * width;
        y = height + 10;
        vx = (Math.random() - 0.5) * 0.8;
        vy = -0.5 - Math.random() * 0.3;
        break;
      case 3: // Лево
        x = -10;
        y = Math.random() * height;
        vx = 0.5 + Math.random() * 0.3;
        vy = (Math.random() - 0.5) * 0.8;
        break;
    }

    asteroid.setPosition(x, y);
    asteroid.setDepth(-60);

    // Простые данные астероида
    (asteroid as any).asteroidData = {
      size: size,
      velocity: { x: vx, y: vy },
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      currentRotation: 0
    };

    return asteroid;
  }

// ОБНОВИТЕ метод updateAsteroids:
  updateAsteroids() {
    const width = this.scale.width;
    const height = this.scale.height;
    const margin = 100;

    // Очищаем списки для этого кадра
    this.asteroidsToRemove = [];
    this.asteroidsToAdd = [];

    // Отладочная информация
    if (this.asteroids.length === 0) {
      console.log('No asteroids in array!');
      return;
    }

    // Обновляем каждый астероид
    for (let i = 0; i < this.asteroids.length; i++) {
      const asteroid = this.asteroids[i];

      // Проверяем, что астероид ещё существует
      if (!asteroid || !asteroid.active) {
        this.asteroidsToRemove.push(i);
        continue;
      }

      const data = (asteroid as any).asteroidData;

      // Обновляем позицию
      asteroid.x += data.velocity.x;
      asteroid.y += data.velocity.y;

      // Обновляем вращение
      data.currentRotation += data.rotationSpeed;
      asteroid.rotation = data.currentRotation;

      // Проверяем выход за пределы с запасом
      const isOutOfBounds =
        asteroid.x < -margin ||
        asteroid.x > width + margin ||
        asteroid.y < -margin ||
        asteroid.y > height + margin;

      if (isOutOfBounds) {
        // Помечаем для удаления
        this.asteroidsToRemove.push(i);
      } else {
        // Проверяем столкновения только если в пределах экрана
        this.checkAsteroidCollisions(asteroid, i);
      }
    }

    // Удаляем помеченные астероиды (в обратном порядке)
    for (let i = this.asteroidsToRemove.length - 1; i >= 0; i--) {
      const index = this.asteroidsToRemove[i];
      const asteroid = this.asteroids[index];

      if (asteroid) {
        asteroid.destroy();
      }
      this.asteroids.splice(index, 1);

      // Создаём новый астероид НА КРАЮ (вместо того чтобы сразу в пространстве)
      const newAsteroid = this.createAsteroidAtEdge();
      this.asteroids.push(newAsteroid);
    }

    // Добавляем новые астероиды
    this.asteroidsToAdd.forEach(asteroid => {
      this.asteroids.push(asteroid);
    });
    this.asteroidsToAdd = [];

    // Отладочная информация (реже, чтобы не засорять консоль)
    if (Math.random() < 0.01) { // Только 1% шанс на логирование
      console.log(`Asteroids: ${this.asteroids.length}, Removed: ${this.asteroidsToRemove.length}, Added: ${this.asteroidsToAdd.length}`);
    }
  }

// ОБНОВИТЕ метод explodeAsteroid:
  explodeAsteroid(asteroid: Phaser.GameObjects.Graphics, asteroidIndex: number) {
    const asteroidData = (asteroid as any).asteroidData;

    // Создаём взрыв
    this.createExplosion(asteroid.x, asteroid.y, asteroidData.size);

    // Звук взрыва
    this._phaserMusicService.playSound(SoundsTrack.AsteroidExplosion);

    // Помечаем для удаления
    this.asteroidsToRemove.push(asteroidIndex);

    // Анимация взрыва
    this.tweens.add({
      targets: asteroid,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        asteroid.destroy();

        // Создаём новый астероид через небольшую задержку НА КРАЮ
        this.time.delayedCall(500, () => {
          const newAsteroid = this.createAsteroidAtEdge();
          this.asteroidsToAdd.push(newAsteroid);
        });
      }
    });
  }

  createAsteroid(sceneWidth?: number, sceneHeight?: number): Phaser.GameObjects.Graphics {
    const width = sceneWidth || this.scale.width;
    const height = sceneHeight || this.scale.height;

    const asteroid = this.add.graphics();
    const size = 3 + Math.random() * 4;

    const colorVariants = [0x555555, 0x666666, 0x777777];
    const color = colorVariants[Math.floor(Math.random() * colorVariants.length)];

    // Создаём форму астероида
    const points = this.generateAsteroidShape(0, 0, size);
    asteroid.fillStyle(color, 0.9);
    asteroid.fillPoints(points, true);
    asteroid.lineStyle(1, 0x444444, 0.6);
    asteroid.strokePoints(points, true);

    // Начальная позиция на краю экрана
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;

    switch (side) {
      case 0: // Верх
        x = Math.random() * width;
        y = -10;
        vx = (Math.random() - 0.5) * 0.8;
        vy = 0.5 + Math.random() * 0.3;
        break;
      case 1: // Право
        x = width + 10;
        y = Math.random() * height;
        vx = -0.5 - Math.random() * 0.3;
        vy = (Math.random() - 0.5) * 0.8;
        break;
      case 2: // Низ
        x = Math.random() * width;
        y = height + 10;
        vx = (Math.random() - 0.5) * 0.8;
        vy = -0.5 - Math.random() * 0.3;
        break;
      case 3: // Лево
        x = -10;
        y = Math.random() * height;
        vx = 0.5 + Math.random() * 0.3;
        vy = (Math.random() - 0.5) * 0.8;
        break;
    }

    asteroid.setPosition(x, y);
    asteroid.setDepth(-60);

    // Простые данные астероида
    (asteroid as any).asteroidData = {
      size: size,
      velocity: { x: vx, y: vy },
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      currentRotation: 0
    };

    return asteroid; // ← ВОЗВРАЩАЕМ asteroid, но НЕ добавляем в массив здесь
  }

  checkAsteroidCollisions(asteroid: Phaser.GameObjects.Graphics, asteroidIndex: number) {
    const asteroidData = (asteroid as any).asteroidData;
    const asteroidX = asteroid.x;
    const asteroidY = asteroid.y;
    const asteroidSize = asteroidData.size;

    // Проверяем столкновение с каждой планетой
    for (const planet of this.planets) {
      const planetX = planet.x;
      const planetY = planet.y;
      const planetRadius = (planet as any).planetRadius || 35;

      const distance = Phaser.Math.Distance.Between(asteroidX, asteroidY, planetX, planetY);
      const collisionDistance = planetRadius + asteroidSize;

      if (distance < collisionDistance) {
        this.explodeAsteroid(asteroid, asteroidIndex);
        break; // Прерываем после первого столкновения
      }
    }
  }

  createExplosion(x: number, y: number, size: number) {
    this.explosionEmitter.setPosition(x, y);
    this.explosionEmitter.setScale(size / 6);
    this.explosionEmitter.explode(10 + Math.floor(size * 1.5));

    // Простая вспышка
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.7);
    flash.fillCircle(x, y, size * 1.5);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy()
    });
  }

  generateAsteroidShape(centerX: number, centerY: number, baseSize: number): Phaser.Types.Math.Vector2Like[] {
    const points: Phaser.Types.Math.Vector2Like[] = [];
    const numPoints = 6 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const variation = 0.7 + Math.random() * 0.6;
      const radius = baseSize * variation;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      points.push({ x, y });
    }

    // Замыкаем полигон
    points.push({ x: points[0].x, y: points[0].y });

    return points;
  }

  // При уничтожении сцены очищаем таймер
  destroy() {
    if (this.asteroidUpdateEvent) {
      this.asteroidUpdateEvent.remove();
    }
    //super.destroy();
  }
  
  createPlanets(width: number, height: number) {
    const planetData: Array<{ x: number, y: number, scale: number, type: PlanetType }> = [
      {x: width * 0.15, y: height * 0.2, scale: 0.6, type: PlanetType.GAS},
      {x: width * 0.85, y: height * 0.25, scale: 0.8, type: PlanetType.EARTH},
      {x: width * 0.2, y: height * 0.75, scale: 0.5, type: PlanetType.LAVA},
      {x: width * 0.78, y: height * 0.7, scale: 0.7, type: PlanetType.ICE}
    ];

    planetData.forEach((data, index) => {
      const size = 50 + Math.random() * 40;
      const planet = this.generatePlanet(size, size, data.type);
      planet.setPosition(data.x, data.y);
      planet.setScale(data.scale);
      planet.setDepth(-50 + index);

      // Сохраняем радиус для проверки столкновений
      (planet as any).planetRadius = (size * data.scale) / 2;

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

  createSpaceBackground(width: number, height: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0a0a1a, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.setDepth(-100);
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
