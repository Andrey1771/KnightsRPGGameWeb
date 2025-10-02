import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';

export interface PlanetData {
  x: number;
  y: number;
  scale: number;
  type: string;
}

interface PlanetScheme {
  base: number;
  dark: number;
  light: number;
  accent: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlanetManagerService {
  private planets = new Map<string, Phaser.GameObjects.Container[]>();

  createPlanets(scene: Phaser.Scene, width: number, height: number): string {
    const planetsId = `planets_${Date.now()}`;
    const planetContainers: Phaser.GameObjects.Container[] = [];

    const planetData: PlanetData[] = [
      { x: width * 0.15, y: height * 0.2, scale: 0.6, type: 'gas' },
      { x: width * 0.85, y: height * 0.25, scale: 0.8, type: 'earth' },
      { x: width * 0.2, y: height * 0.75, scale: 0.5, type: 'lava' },
      { x: width * 0.78, y: height * 0.7, scale: 0.7, type: 'ice' }
    ];

    planetData.forEach((data, index) => {
      const size = 50 + Math.random() * 40;
      const planet = this.generatePlanet(scene, size, size, data.type);
      planet.setPosition(data.x, data.y);
      planet.setScale(data.scale);
      planet.setDepth(-50 + index);

      (planet as any).planetRadius = (size * data.scale) / 2;

      scene.tweens.add({
        targets: planet,
        angle: 360,
        duration: 90000 + Math.random() * 60000,
        repeat: -1,
        ease: 'Linear'
      });

      planetContainers.push(planet);
    });

    this.planets.set(planetsId, planetContainers);
    return planetsId;
  }

  getPlanets(planetsId: string): Phaser.GameObjects.Container[] {
    return this.planets.get(planetsId) || [];
  }

  destroyPlanets(planetsId: string): void {
    const planets = this.planets.get(planetsId);
    if (planets) {
      planets.forEach(planet => planet.destroy());
      this.planets.delete(planetsId);
    }
  }

  private generatePlanet(scene: Phaser.Scene, width: number, height: number, type: string): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0);
    const radius = Math.min(width, height) / 2;

    const planetSchemes: Record<string, PlanetScheme> = {
      earth: { base: 0x4a7f5a, dark: 0x2a5f3a, light: 0x6a9f7a, accent: 0x8abf8a },
      gas: { base: 0x9f8a4a, dark: 0x7f6a2a, light: 0xbfaa6a, accent: 0xdfca8a },
      lava: { base: 0xbf5a3a, dark: 0x9f3a1a, light: 0xdf7a5a, accent: 0xff9a7a },
      ice: { base: 0x7a9fbf, dark: 0x5a7f9f, light: 0x9abfdf, accent: 0xbadfff }
    };

    const scheme = planetSchemes[type] || planetSchemes['earth'];

    const planetMain = scene.add.graphics();
    planetMain.fillStyle(scheme.base);
    planetMain.fillCircle(0, 0, radius);

    const surfaceDetails = scene.add.graphics();
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

    for (let i = 0; i < 3; i++) {
      const featureSize = Phaser.Math.Between(10, 18);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (radius - featureSize - 5);

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      surfaceDetails.fillStyle(scheme.accent, 0.4);
      surfaceDetails.fillCircle(x, y, featureSize);
    }

    const atmosphere = scene.add.graphics();
    for (let i = 1; i <= 2; i++) {
      const atmRadius = radius + i * 4;
      const alpha = 0.08 - (i * 0.03);
      atmosphere.fillStyle(scheme.light, alpha);
      atmosphere.fillCircle(0, 0, atmRadius);
    }

    if (type === 'earth' || type === 'gas') {
      const clouds = scene.add.graphics();
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

      scene.tweens.add({
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
}
