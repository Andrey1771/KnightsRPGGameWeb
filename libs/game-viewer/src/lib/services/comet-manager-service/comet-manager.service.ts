import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';

@Injectable({
  providedIn: 'root'
})
export class CometManagerService {
  private comets = new Map<string, Phaser.GameObjects.Container[]>();

  createCometSystem(scene: Phaser.Scene, width: number, height: number): string {
    const systemId = `comets_${Date.now()}`;
    const comets: Phaser.GameObjects.Container[] = [];

    // Создаём 2-3 начальные кометы
    const cometCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < cometCount; i++) {
      const comet = this.createSimpleComet(scene, width, height, systemId);
      comets.push(comet);
    }

    // Запускаем создание новых комет
    scene.time.addEvent({
      delay: 10000 + Math.random() * 5000,
      callback: () => {
        const newComet = this.createSimpleComet(scene, width, height, systemId);
        comets.push(newComet);
      },
      callbackScope: this,
      loop: true
    });

    this.comets.set(systemId, comets);
    return systemId;
  }

  destroyCometSystem(systemId: string): void {
    const comets = this.comets.get(systemId);
    if (comets) {
      comets.forEach(comet => comet.destroy());
      this.comets.delete(systemId);
    }
  }

  private createSimpleComet(
    scene: Phaser.Scene,
    width: number,
    height: number,
    systemId: string
  ): Phaser.GameObjects.Container {
    const cometKey = 'comet_smooth_' + Date.now() + Math.random();
    this.createSmoothCometTexture(scene, cometKey);

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

    const cometContainer = scene.add.container(startX, startY);
    cometContainer.setDepth(-55);

    // Создаём спрайт кометы
    const cometSprite = scene.add.sprite(0, 0, cometKey);
    cometContainer.add(cometSprite);

    // Вычисляем угол поворота
    const velocityX = endX - startX;
    const velocityY = endY - startY;
    const angle = Math.atan2(velocityY, velocityX);
    cometSprite.setRotation(angle + Math.PI / 2);

    // Эмиттер частиц для хвоста
    const tailEmitter = scene.add.particles(0, 0, 'star', {
      follow: cometContainer,
      x: 0,
      y: 0,
      lifespan: 600,
      speed: { min: 15, max: 40 },
      angle: {
        min: angle * (180 / Math.PI) - 8,
        max: angle * (180 / Math.PI) + 8
      },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      quantity: 4,
      frequency: 40,
      blendMode: 'ADD',
      tint: [0x88aaff, 0xaaccff, 0x4466ff]
    });

    tailEmitter.setDepth(-56);

    // Движение кометы
    scene.tweens.add({
      targets: cometContainer,
      x: endX,
      y: endY,
      duration: 3500 + Math.random() * 2000,
      ease: 'Linear',
      onComplete: () => {
        cometContainer.destroy();
        tailEmitter.destroy();

        // Удаляем текстуру
        if (scene.textures.exists(cometKey)) {
          scene.textures.remove(cometKey);
        }

        // Удаляем из массива комет
        const comets = this.comets.get(systemId);
        if (comets) {
          const index = comets.indexOf(cometContainer);
          if (index > -1) {
            comets.splice(index, 1);
          }
        }
      }
    });

    return cometContainer;
  }

  private createSmoothCometTexture(scene: Phaser.Scene, key: string): void {
    const size = 32; // Размер текстуры

    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);

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

  // Метод для полной очистки всех систем
  destroyAllSystems(): void {
    this.comets.forEach((comets, systemId) => {
      this.destroyCometSystem(systemId);
    });
    this.comets.clear();
  }
}
