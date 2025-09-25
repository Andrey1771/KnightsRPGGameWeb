import * as Phaser from 'phaser';

export class SpaceBackgroundScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Arc[] = [];
  private particles: any; // Обходим ошибку типов
  private starEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private comets!: Phaser.Physics.Arcade.Group;
  private nebula: any;

  constructor() {
    super({ key: 'SpaceBackgroundScene' });
  }

  create() {
    const gameWidth = Number(this.sys.game.config.width) || 1280;
    const gameHeight = Number(this.sys.game.config.height) || 720;

    // Небула
    this.nebula = this.add.shader(
      'nebula',
      gameWidth / 2,
      gameHeight / 2,
      gameWidth,
      gameHeight
    );

    // Звезды
    for (let i = 0; i < 300; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, gameWidth),
        Phaser.Math.Between(0, gameHeight),
        Phaser.Math.Between(1, 2),
        0xffffff
      );
      (star as any).speed = Phaser.Math.FloatBetween(0.2, 1.5);
      this.stars.push(star);
    }

    this.createParticleTexture();

    // Частицы
    this.starEmitter = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: gameWidth },
      y: { min: 0, max: gameHeight },
      lifespan: 2000,
      speed: { min: 5, max: 15 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 1, end: 0 },
      quantity: 2,
      blendMode: 'ADD'
    });

    // Кометы
    this.comets = this.physics.add.group();
    this.time.addEvent({
      delay: 5000,
      callback: this.spawnComet,
      callbackScope: this,
      loop: true
    });
  }

  private createParticleTexture() {
    const size = 8;
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    // Белый круг с прозрачными краями
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2);

    graphics.generateTexture('particle', size, size);
    graphics.destroy();
  }

  private createCometTexture(key: string) {
    const width = Phaser.Math.Between(20, 60);
    const height = Phaser.Math.Between(4, 12);
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);

    // Центр кометы яркий белый
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(width * 0.7, height / 2, width * 0.6, height);

    // Хвост кометы прозрачный
    graphics.fillStyle(0xffffff, 0.2);
    graphics.fillRect(0, height / 2 - height / 4, width * 0.7, height / 2);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  private createColoredParticleTexture(color: number, key: string) {
    const size = 6;
    const graphics = this.make.graphics({ }, false);
    graphics.fillStyle(color, 1);
    graphics.fillCircle(size/2, size/2, size/2);
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  private createGradientParticleTexture(key: string, innerColor: number, outerColor: number) {
    const size = 12;
    const graphics = this.make.graphics({ }, false);

    const inner = Phaser.Display.Color.IntegerToColor(innerColor);
    const outer = Phaser.Display.Color.IntegerToColor(outerColor);

    // Симулируем градиент через несколько полупрозрачных кругов
    for (let i = size/2; i > 0; i--) {
      const t = i / (size/2);
      const r = Phaser.Math.Interpolation.Linear([outer.red, inner.red], t);
      const g = Phaser.Math.Interpolation.Linear([outer.green, inner.green], t);
      const b = Phaser.Math.Interpolation.Linear([outer.blue, inner.blue], t);
      const a = t * 0.7; // прозрачность
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), a);
      graphics.fillCircle(size/2, size/2, i);
    }

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  private createCometGradientTexture(key: string, width: number = 40, height: number = 10) {
    const graphics = this.make.graphics({ }, false);

    // Центр кометы — белый эллипс внизу текстуры
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(width/2, height*0.8, width*0.4, height*0.4);

    // Хвост кометы — прямой градиент от белого (внизу) к красному (вверху)
    const gradientSteps = 20;
    for (let i = 0; i < gradientSteps; i++) {
      const t = i / gradientSteps;
      const r = Phaser.Math.Interpolation.Linear([255, 255], t); // белый к красному
      const g = Phaser.Math.Interpolation.Linear([255, 51], t);
      const b = Phaser.Math.Interpolation.Linear([255, 51], t);
      const a = (1 - t) * 0.7;
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), a);
      const tailHeight = height * 0.8 * (1 - t);
      graphics.fillEllipse(width/2, height*0.8 - t*height*0.8, width*0.4, tailHeight);
    }

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  private spawnComet() {
    const x = Phaser.Math.Between(0, this.sys.game.config.width as number);
    const y = -50;

    const velocityX = Phaser.Math.Between(-100, 100);
    const velocityY = Phaser.Math.Between(200, 400);

    const cometColor = Phaser.Display.Color.RandomRGB();

    // --- Тело кометы (круглый центр) ---
    const bodyKey = 'cometBody' + Phaser.Math.Between(0, 1000);
    const graphicsBody = this.make.graphics({ }, false);
    graphicsBody.fillStyle(Phaser.Display.Color.GetColor(cometColor.red, cometColor.green, cometColor.blue), 1);
    graphicsBody.fillCircle(6, 6, 6); // Круглый центр
    graphicsBody.generateTexture(bodyKey, 12, 12);
    graphicsBody.destroy();

    const comet = this.comets.create(x, y, bodyKey) as Phaser.Physics.Arcade.Image;
    comet.setVelocity(velocityX, velocityY);

    // Поворот под направление движения
    const angle = Math.atan2(velocityY, velocityX) - Math.PI/2;
    comet.setRotation(angle);

    // --- Хвост кометы через маленькие шарики ---
    const tailKey = 'cometTailParticle' + Phaser.Math.Between(0, 1000);
    const particleSize = 6;
    const particleGraphics = this.make.graphics({ }, false);
    particleGraphics.fillStyle(Phaser.Display.Color.GetColor(cometColor.red, cometColor.green, cometColor.blue), 1);
    particleGraphics.fillCircle(particleSize/2, particleSize/2, particleSize/2);
    particleGraphics.generateTexture(tailKey, particleSize, particleSize);
    particleGraphics.destroy();

    this.add.particles(0, 0, tailKey, {
      follow: comet,
      lifespan: 400,
      speed: { min: 0, max: 0 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      blendMode: 'ADD',
      quantity: 1,
      frequency: 30
    });

    // Удаляем комету через 8 секунд
    this.time.addEvent({
      delay: 8000,
      callback: () => comet.destroy()
    });
  }


  override update() {
    const gameWidth = Number(this.sys.game.config.width) || 1280;
    const gameHeight = Number(this.sys.game.config.height) || 720;

    for (const star of this.stars) {
      (star as any).y += (star as any).speed;
      if ((star as any).y > gameHeight) {
        (star as any).x = Phaser.Math.Between(0, gameWidth);
        (star as any).y = Phaser.Math.Between(0, gameHeight);
      }
    }

    // Анимируем шейдер
    if (this.nebula && this.nebula.setUniform) {
      this.nebula.setUniform('time.value', this.time.now / 1000);
    }
  }
}
