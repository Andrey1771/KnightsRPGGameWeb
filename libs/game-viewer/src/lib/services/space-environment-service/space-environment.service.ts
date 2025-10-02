import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';

export interface SpaceEnvironment {
  stars: Phaser.GameObjects.Particles.ParticleEmitter[];
  nebulae: Phaser.GameObjects.Graphics[];
  spaceDust: Phaser.GameObjects.Particles.ParticleEmitter[];
  staticStars: Phaser.GameObjects.Graphics[];
  distantStars: Phaser.GameObjects.Graphics[];
}

@Injectable({
  providedIn: 'root'
})
export class SpaceEnvironmentService {
  private environments = new Map<string, SpaceEnvironment>();

  createEnvironment(scene: Phaser.Scene, width: number, height: number): string {
    const environmentId = `env_${Date.now()}`;
    const environment: SpaceEnvironment = {
      stars: [],
      nebulae: [],
      spaceDust: [],
      staticStars: [],
      distantStars: []
    };

    this.createSpaceBackground(scene, width, height);
    this.createNebulae(scene, environment, width, height);
    this.createStarfield(scene, environment, width, height);
    this.createStaticStarfield(scene, environment, width, height);
    this.createSpaceDust(scene, environment, width, height);
    this.createDistantStars(scene, environment, width, height);

    this.environments.set(environmentId, environment);
    return environmentId;
  }

  destroyEnvironment(environmentId: string): void {
    const environment = this.environments.get(environmentId);
    if (environment) {
      [...environment.stars, ...environment.spaceDust].forEach(emitter => emitter.destroy());
      [...environment.nebulae, ...environment.staticStars, ...environment.distantStars].forEach(gfx => gfx.destroy());
      this.environments.delete(environmentId);
    }
  }

  private createSpaceBackground(scene: Phaser.Scene, width: number, height: number): void {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x0a0a1a, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.setDepth(-100);
  }

  private createNebulae(scene: Phaser.Scene, environment: SpaceEnvironment, width: number, height: number): void {
    const nebulaData = [
      { x: 0.2, y: 0.3, color: 0x331155, alpha: 0.12, scale: 1.2 },
      { x: 0.8, y: 0.7, color: 0x115533, alpha: 0.10, scale: 1.0 },
      { x: 0.4, y: 0.8, color: 0x551122, alpha: 0.11, scale: 0.9 },
      { x: 0.7, y: 0.2, color: 0x223355, alpha: 0.09, scale: 1.1 },
      { x: 0.1, y: 0.7, color: 0x553366, alpha: 0.08, scale: 0.8 },
      { x: 0.9, y: 0.1, color: 0x336655, alpha: 0.07, scale: 1.3 }
    ];

    nebulaData.forEach((data) => {
      const graphics = scene.add.graphics();
      const centerX = width * data.x;
      const centerY = height * data.y;
      const radius = 120 * data.scale;

      for (let i = 0; i < 4; i++) {
        const currentRadius = radius * (0.5 + i * 0.25);
        const currentAlpha = data.alpha * (0.9 - i * 0.2);
        graphics.fillStyle(data.color, currentAlpha);
        graphics.fillCircle(centerX, centerY, currentRadius);
      }

      graphics.setDepth(-90);

      if (Math.random() > 0.5) {
        scene.tweens.add({
          targets: graphics,
          alpha: { from: data.alpha * 0.8, to: data.alpha },
          duration: 8000 + Math.random() * 4000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      environment.nebulae.push(graphics);
    });
  }

  private createStarfield(scene: Phaser.Scene, environment: SpaceEnvironment, width: number, height: number): void {
    const smallStars = scene.add.particles(0, 0, 'star', {
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

    const averageStars = scene.add.particles(0, 0, 'star', {
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

    environment.stars.push(smallStars, averageStars);
  }

  private createStaticStarfield(scene: Phaser.Scene, environment: SpaceEnvironment, width: number, height: number): void {
    for (let i = 0; i < 200; i++) {
      const star = scene.add.graphics();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      const brightness = 0.3 + Math.random() * 0.7;

      const colors = [0xffffff, 0xeeeeff, 0xffffee, 0xffffee];
      const color = colors[Math.floor(Math.random() * colors.length)];

      star.fillStyle(color, brightness);
      star.fillCircle(x, y, size);
      star.setDepth(-85);

      environment.staticStars.push(star);
    }
  }

  private createSpaceDust(scene: Phaser.Scene, environment: SpaceEnvironment, width: number, height: number): void {
    const dust1 = scene.add.particles(0, 0, 'star', {
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

    const dust2 = scene.add.particles(0, 0, 'star', {
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

    environment.spaceDust.push(dust1, dust2);
  }

  private createDistantStars(scene: Phaser.Scene, environment: SpaceEnvironment, width: number, height: number): void {
    for (let i = 0; i < 25; i++) {
      const star = scene.add.graphics();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 0.8 + Math.random() * 2;
      const brightness = 0.3 + Math.random() * 0.7;

      const colors = [0xffffff, 0xffffaa, 0xaaffff, 0xffaaff];
      const color = colors[Math.floor(Math.random() * colors.length)];

      star.fillStyle(color, brightness);
      star.fillCircle(x, y, size);
      star.setDepth(-45);

      const minAlpha = brightness * 0.4;
      const maxAlpha = brightness;
      const duration = 1000 + Math.random() * 2000;

      scene.tweens.add({
        targets: star,
        alpha: { from: minAlpha, to: maxAlpha },
        duration: duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 2000
      });

      if (Math.random() > 0.7) {
        scene.tweens.add({
          targets: star,
          x: x + Phaser.Math.Between(-5, 5),
          y: y + Phaser.Math.Between(-5, 5),
          duration: 15000 + Math.random() * 10000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      environment.distantStars.push(star);
    }
  }
}
