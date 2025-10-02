import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';
import {PhaserMusicService, SoundsTrack} from '../phaser-music-service/phaser-music-service';

export interface AsteroidField {
  asteroids: Phaser.GameObjects.Graphics[];
  explosionEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  updateEvent?: Phaser.Time.TimerEvent;
  asteroidsToRemove: number[];
  asteroidsToAdd: Phaser.GameObjects.Graphics[];
}

@Injectable({
  providedIn: 'root'
})
export class AsteroidFieldService {
  private fields = new Map<string, AsteroidField>();

  constructor(private _phaserMusicService: PhaserMusicService) {
  }

  createField(scene: Phaser.Scene, width: number, height: number, planets: any[]): string {
    const fieldId = `asteroids_${Date.now()}`;
    const field: AsteroidField = {
      asteroids: [],
      explosionEmitter: this.createExplosionEmitter(scene),
      asteroidsToRemove: [],
      asteroidsToAdd: []
    };

    for (let i = 0; i < 15; i++) {
      const asteroid = this.createAsteroidInSpace(scene, width, height);
      field.asteroids.push(asteroid);
    }

    field.updateEvent = scene.time.addEvent({
      delay: 16,
      callback: () => this.updateAsteroids(scene, field, width, height, planets),
      callbackScope: this,
      loop: true
    });

    this.fields.set(fieldId, field);
    return fieldId;
  }

  destroyField(fieldId: string): void {
    const field = this.fields.get(fieldId);
    if (field) {
      field.updateEvent?.remove();
      field.asteroids.forEach(asteroid => asteroid.destroy());
      field.explosionEmitter.destroy();
      this.fields.delete(fieldId);
    }
  }

  private createAsteroidInSpace(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Graphics {
    const asteroid = scene.add.graphics();
    const size = 3 + Math.random() * 4;

    const colorVariants = [0x555555, 0x666666, 0x777777];
    const color = colorVariants[Math.floor(Math.random() * colorVariants.length)];

    const points = this.generateAsteroidShape(0, 0, size);
    asteroid.fillStyle(color, 0.9);
    asteroid.fillPoints(points, true);
    asteroid.lineStyle(1, 0x444444, 0.6);
    asteroid.strokePoints(points, true);

    const x = Math.random() * width;
    const y = Math.random() * height;
    const speed = 0.3 + Math.random() * 0.4;
    const angle = Math.random() * Math.PI * 2;

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    asteroid.setPosition(x, y);
    asteroid.setDepth(-60);

    (asteroid as any).asteroidData = {
      size: size,
      velocity: { x: vx, y: vy },
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      currentRotation: 0
    };

    return asteroid;
  }

  private createAsteroidAtEdge(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Graphics {
    const asteroid = scene.add.graphics();
    const size = 3 + Math.random() * 4;

    const colorVariants = [0x555555, 0x666666, 0x777777];
    const color = colorVariants[Math.floor(Math.random() * colorVariants.length)];

    const points = this.generateAsteroidShape(0, 0, size);
    asteroid.fillStyle(color, 0.9);
    asteroid.fillPoints(points, true);
    asteroid.lineStyle(1, 0x444444, 0.6);
    asteroid.strokePoints(points, true);

    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;

    switch (side) {
      case 0:
        x = Math.random() * width;
        y = -10;
        vx = (Math.random() - 0.5) * 0.8;
        vy = 0.5 + Math.random() * 0.3;
        break;
      case 1:
        x = width + 10;
        y = Math.random() * height;
        vx = -0.5 - Math.random() * 0.3;
        vy = (Math.random() - 0.5) * 0.8;
        break;
      case 2:
        x = Math.random() * width;
        y = height + 10;
        vx = (Math.random() - 0.5) * 0.8;
        vy = -0.5 - Math.random() * 0.3;
        break;
      case 3:
        x = -10;
        y = Math.random() * height;
        vx = 0.5 + Math.random() * 0.3;
        vy = (Math.random() - 0.5) * 0.8;
        break;
    }

    asteroid.setPosition(x, y);
    asteroid.setDepth(-60);

    (asteroid as any).asteroidData = {
      size: size,
      velocity: { x: vx, y: vy },
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      currentRotation: 0
    };

    return asteroid;
  }

  private updateAsteroids(scene: Phaser.Scene, field: AsteroidField, width: number, height: number, planets: any[]): void {
    const margin = 100;
    field.asteroidsToRemove = [];
    field.asteroidsToAdd = [];

    for (let i = 0; i < field.asteroids.length; i++) {
      const asteroid = field.asteroids[i];
      if (!asteroid || !asteroid.active) {
        field.asteroidsToRemove.push(i);
        continue;
      }

      const data = (asteroid as any).asteroidData;
      asteroid.x += data.velocity.x;
      asteroid.y += data.velocity.y;
      data.currentRotation += data.rotationSpeed;
      asteroid.rotation = data.currentRotation;

      const isOutOfBounds = asteroid.x < -margin || asteroid.x > width + margin ||
        asteroid.y < -margin || asteroid.y > height + margin;

      if (isOutOfBounds) {
        field.asteroidsToRemove.push(i);
      } else {
        this.checkAsteroidCollisions(scene, field, asteroid, i, planets);
      }
    }

    for (let i = field.asteroidsToRemove.length - 1; i >= 0; i--) {
      const index = field.asteroidsToRemove[i];
      const asteroid = field.asteroids[index];
      if (asteroid) asteroid.destroy();
      field.asteroids.splice(index, 1);
      const newAsteroid = this.createAsteroidAtEdge(scene, width, height);
      field.asteroids.push(newAsteroid);
    }

    field.asteroidsToAdd.forEach(asteroid => {
      field.asteroids.push(asteroid);
    });
    field.asteroidsToAdd = [];
  }

  private checkAsteroidCollisions(scene: Phaser.Scene, field: AsteroidField, asteroid: Phaser.GameObjects.Graphics, asteroidIndex: number, planets: any[]): void {
    const asteroidData = (asteroid as any).asteroidData;
    const asteroidX = asteroid.x;
    const asteroidY = asteroid.y;
    const asteroidSize = asteroidData.size;

    for (const planet of planets) {
      const planetX = planet.x;
      const planetY = planet.y;
      const planetRadius = (planet as any).planetRadius || 35;

      const distance = Phaser.Math.Distance.Between(asteroidX, asteroidY, planetX, planetY);
      const collisionDistance = planetRadius + asteroidSize;

      if (distance < collisionDistance) {
        this.explodeAsteroid(scene, field, asteroid, asteroidIndex);
        break;
      }
    }
  }

  private explodeAsteroid(scene: Phaser.Scene, field: AsteroidField, asteroid: Phaser.GameObjects.Graphics, asteroidIndex: number): void {
    const asteroidData = (asteroid as any).asteroidData;

    this.createExplosion(scene, field.explosionEmitter, asteroid.x, asteroid.y, asteroidData.size);

    this._phaserMusicService.playSound(SoundsTrack.AsteroidExplosion);

    field.asteroidsToRemove.push(asteroidIndex);

    scene.tweens.add({
      targets: asteroid,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        asteroid.destroy();
        scene.time.delayedCall(500, () => {
          const newAsteroid = this.createAsteroidAtEdge(scene, scene.scale.width, scene.scale.height);
          field.asteroidsToAdd.push(newAsteroid);
        });
      }
    });
  }

  private createExplosion(scene: Phaser.Scene, explosionEmitter: Phaser.GameObjects.Particles.ParticleEmitter, x: number, y: number, size: number): void {
    explosionEmitter.setPosition(x, y);
    explosionEmitter.setScale(size / 6);
    explosionEmitter.explode(10 + Math.floor(size * 1.5));

    const flash = scene.add.graphics();
    flash.fillStyle(0xffffff, 0.7);
    flash.fillCircle(x, y, size * 1.5);

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy()
    });
  }

  private createExplosionEmitter(scene: Phaser.Scene): Phaser.GameObjects.Particles.ParticleEmitter {
    return scene.add.particles(0, 0, 'star', {
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 10,
      frequency: -1,
      blendMode: 'ADD',
      tint: [0xff4400, 0xff8844, 0xffff00]
    });
  }

  private generateAsteroidShape(centerX: number, centerY: number, baseSize: number): Phaser.Types.Math.Vector2Like[] {
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

    points.push({ x: points[0].x, y: points[0].y });
    return points;
  }
}
