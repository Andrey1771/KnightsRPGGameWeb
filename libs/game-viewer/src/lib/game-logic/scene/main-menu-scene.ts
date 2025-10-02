import { MusicTrack, PhaserMusicService, SoundsTrack } from '../../services/phaser-music-service/phaser-music-service';
import * as Phaser from 'phaser';
import { SpaceEnvironmentService } from '../../services/space-environment-service/space-environment.service';
import { AsteroidFieldService } from '../../services/asteroid-field-service/asteroid-field.service';
import { CometManagerService } from '../../services/comet-manager-service/comet-manager.service';
import { PlanetManagerService } from '../../services/planet-manager-service/planet-manager.service';

export class MainMenuScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private spaceEnvironmentService!: SpaceEnvironmentService;
  private asteroidFieldService!: AsteroidFieldService;
  private cometManagerService!: CometManagerService;
  private planetManagerService!: PlanetManagerService;

  private environmentId!: string;
  private asteroidFieldId!: string;
  private cometSystemId!: string;
  private planetsId!: string;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    this._phaserMusicService = this.registry.get('musicService') as PhaserMusicService;
    this.spaceEnvironmentService = this.registry.get('spaceEnvironmentService') as SpaceEnvironmentService;
    this.asteroidFieldService = this.registry.get('asteroidFieldService') as AsteroidFieldService;
    this.cometManagerService = this.registry.get('cometManagerService') as CometManagerService;
    this.planetManagerService = this.registry.get('planetManagerService') as PlanetManagerService;

    this.scene.launch('UIOverlayScene', { showPauseButton: false, showName: true, readOnly: false });
    this._phaserMusicService.init(this);
    this._phaserMusicService.playMusic(MusicTrack.MainTheme);

    const { width, height } = this.scale;

    this.environmentId = this.spaceEnvironmentService.createEnvironment(this, width, height);
    this.planetsId = this.planetManagerService.createPlanets(this, width, height);

    const planets = this.planetManagerService.getPlanets(this.planetsId);
    this.asteroidFieldId = this.asteroidFieldService.createField(this, width, height, planets);
    this.cometSystemId = this.cometManagerService.createCometSystem(this, width, height);

    this.createTitle(width, height);
    this.createMenuButtons(width, height);
  }

  shutdown() {
    this.spaceEnvironmentService.destroyEnvironment(this.environmentId);
    this.asteroidFieldService.destroyField(this.asteroidFieldId);
    this.cometManagerService.destroyCometSystem(this.cometSystemId);
    this.planetManagerService.destroyPlanets(this.planetsId);
  }

  private createTitle(width: number, height: number): void {
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

    const subtitle = this.add.text(width / 2, height * 0.22, 'КОСМИЧЕСКАЯ СТРЕЛЯЛКА', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaccff',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [title, subtitle],
      alpha: { from: 0.9, to: 1 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createMenuButtons(width: number, height: number): void {
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

    const textMetrics: { width: number, text: Phaser.GameObjects.Text }[] = [];
    buttons.forEach((buttonInfo) => {
      const tempText = this.add.text(0, 0, buttonInfo.text, {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ccddee',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      textMetrics.push({ width: tempText.width, text: tempText });
      tempText.destroy();
    });

    const maxTextWidth = Math.max(...textMetrics.map(m => m.width));
    const totalButtonWidth = maxTextWidth + 140;

    buttons.forEach((buttonInfo, index) => {
      const buttonGroup = this.add.container(centerX, startY + buttonSpacing * index);
      const buttonHeight = 50;
      const buttonWidth = totalButtonWidth;

      const mainPanel = this.add.graphics();
      mainPanel.fillStyle(0x0a1a2a, 0.9);
      mainPanel.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
      mainPanel.lineStyle(2, 0x223344, 1);
      mainPanel.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);

      const sensorZone = this.add.graphics();
      sensorZone.fillStyle(0x112233, 0.6);
      sensorZone.fillRoundedRect(-buttonWidth/2 + 5, -buttonHeight/2 + 5, buttonWidth - 10, buttonHeight - 10, 5);
      sensorZone.lineStyle(1, buttonInfo.color, 0.3);
      sensorZone.strokeRoundedRect(-buttonWidth/2 + 5, -buttonHeight/2 + 5, buttonWidth - 10, buttonHeight - 10, 5);

      const glowEffect = this.add.graphics();
      glowEffect.fillStyle(buttonInfo.color, 0);
      glowEffect.fillRoundedRect(-buttonWidth/2 - 2, -buttonHeight/2 - 2, buttonWidth + 4, buttonHeight + 4, 10);
      glowEffect.lineStyle(3, buttonInfo.color, 0);
      glowEffect.strokeRoundedRect(-buttonWidth/2 - 2, -buttonHeight/2 - 2, buttonWidth + 4, buttonHeight + 4, 10);

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

      const readyIndicator = this.add.graphics();
      readyIndicator.fillStyle(buttonInfo.color, 0.8);
      readyIndicator.fillCircle(buttonWidth/2 - 15, 0, 4);

      buttonGroup.add([mainPanel, sensorZone, glowEffect, electricityLeft, electricityRight, iconText, buttonText, readyIndicator]);
      buttonGroup.setSize(buttonWidth, buttonHeight);
      buttonGroup.setInteractive();

      let isHovered = false;
      let electricAnimation: Phaser.Tweens.Tween;

      this.tweens.add({
        targets: readyIndicator,
        alpha: { from: 0.3, to: 0.8 },
        duration: 1000 + index * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      const startElectricEffect = () => {
        if (electricAnimation) electricAnimation.stop();

        const updateElectricity = () => {
          electricityLeft.clear();
          electricityRight.clear();
          this.createElectricEffect(electricityLeft, -buttonWidth/2, -buttonHeight/2, buttonHeight, buttonInfo.color, true);
          this.createElectricEffect(electricityRight, buttonWidth/2, -buttonHeight/2, buttonHeight, buttonInfo.color, false);
        };

        electricAnimation = this.tweens.add({
          targets: { value: 0 },
          value: 1,
          duration: 150,
          repeat: -1,
          onRepeat: updateElectricity
        });
        updateElectricity();
      };

      const stopElectricEffect = () => {
        if (electricAnimation) {
          electricAnimation.stop();
          electricAnimation.remove();
        }
        electricityLeft.clear();
        electricityRight.clear();
      };

      buttonGroup.on('pointerover', () => {
        isHovered = true;
        this.tweens.add({
          targets: glowEffect,
          alpha: { from: 0, to: 0.4 },
          duration: 200,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: sensorZone,
          alpha: { from: 0.6, to: 0.8 },
          duration: 200
        });
        this.tweens.add({
          targets: [buttonText, iconText],
          scale: { from: 1, to: 1.05 },
          duration: 150,
          ease: 'Back.easeOut'
        });
        buttonText.setColor('#ffffff');
        iconText.setColor(Phaser.Display.Color.IntegerToColor(buttonInfo.color).rgba);
        startElectricEffect();
        this._phaserMusicService.playSound(SoundsTrack.InterfaceHover);
      });

      buttonGroup.on('pointerout', () => {
        isHovered = false;
        this.tweens.add({
          targets: glowEffect,
          alpha: { from: 0.4, to: 0 },
          duration: 300,
          ease: 'Power2'
        });
        this.tweens.add({
          targets: sensorZone,
          alpha: { from: 0.8, to: 0.6 },
          duration: 200
        });
        this.tweens.add({
          targets: [buttonText, iconText],
          scale: { from: 1.05, to: 1 },
          duration: 150
        });
        buttonText.setColor('#ccddee');
        iconText.setColor('#ffffff');
        stopElectricEffect();
      });

      buttonGroup.on('pointerdown', () => {
        this.tweens.add({
          targets: [glowEffect, sensorZone],
          alpha: { from: isHovered ? 0.4 : 0, to: 0.8 },
          duration: 100,
          yoyo: true
        });
        this.tweens.add({
          targets: buttonGroup,
          scale: { from: 1, to: 0.95 },
          duration: 80,
          yoyo: true,
          onComplete: buttonInfo.callback
        });
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

  private createElectricEffect(graphics: Phaser.GameObjects.Graphics, x: number, y: number, height: number, color: number, isLeft: boolean): void {
    const points: number[] = [];
    const segmentHeight = height / 6;
    points.push(x, y);

    for (let i = 1; i < 6; i++) {
      const currentY = y + i * segmentHeight;
      const offset = isLeft ? -Phaser.Math.Between(2, 6) : Phaser.Math.Between(2, 6);
      points.push(x + offset, currentY);
    }

    points.push(x, y + height);

    graphics.lineStyle(1.2, color, 0.7);
    graphics.beginPath();
    graphics.moveTo(points[0], points[1]);

    for (let i = 2; i < points.length; i += 2) {
      graphics.lineTo(points[i], points[i + 1]);
    }

    graphics.strokePath();

    for (let i = 2; i < points.length - 2; i += 2) {
      if (Math.random() > 0.7) {
        graphics.fillStyle(color, 0.9);
        graphics.fillCircle(points[i], points[i + 1], 0.8);
      }
    }
  }
}
