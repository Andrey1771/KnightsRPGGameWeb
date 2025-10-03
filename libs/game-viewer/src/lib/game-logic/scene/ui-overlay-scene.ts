import * as Phaser from 'phaser';
import InputText from 'phaser3-rex-plugins/plugins/inputtext';
import {PhaserMusicService, SoundsTrack} from "../../services/phaser-music-service/phaser-music-service";
import {SignalRService} from "../../services/signal-r-service/signal-r-service";
import {Store} from '@ngrx/store';
import {selectPlayerName} from "../store/player-settings/player-settings.selectors";
import {generateRandomName, setPlayerName} from '../store/player-settings/player-settings.actions';
import {Subject, take, takeUntil} from "rxjs";
import {PlayerSettingsState} from "../store/player-settings/player-settings.reducer";
import {selectLobbyName} from "../store/lobby/lobby.selectors";
import {LobbyState} from '../store/lobby/lobby.state';

interface UIOverlayData {
  showName?: boolean;
  readOnly?: boolean;
  showPauseButton?: boolean;
}

export class UIOverlayScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private _playerSettingsStore!: Store<{ playerSettings: PlayerSettingsState }>;
  private _gameStateStore!: Store<LobbyState>;
  private _signalRService!: SignalRService;

  private playerNameInput?: InputText;
  private pauseButton?: Phaser.GameObjects.Container;
  private musicButton?: Phaser.GameObjects.Container;
  private soundsButton?: Phaser.GameObjects.Container;
  private fullscreenButton?: Phaser.GameObjects.Container;
  private generateButton?: Phaser.GameObjects.Container;

  private destroy$ = new Subject<void>();

  constructor() {
    super({ key: 'UIOverlayScene' });
  }

  create(data?: UIOverlayData) {
    this._signalRService = this.registry.get('signalR');
    this._phaserMusicService = this.registry.get('musicService');
    this._playerSettingsStore = this.registry.get('playerSettingsStore');
    this._gameStateStore = this.registry.get('lobbyStore');

    const { width } = this.scale;

    this.createTopPanel(width);
    this.createLeftControls(data);
    this.createRightControls();

    this.events.once('shutdown', this.shutDownListener, this);
  }

  private createTopPanel(width: number) {
    const panel = this.add.graphics();
    panel.fillStyle(0x0a0a1a, 0.7);
    panel.fillRect(0, 0, width, 50);

    panel.lineStyle(1, 0x4488ff, 0.4);
    panel.lineBetween(0, 50, width, 50);

    panel.setDepth(1000);
  }

  private createLeftControls(data?: UIOverlayData) {
    const startX = 15;
    const startY = 25;

    if (data?.showName) {
      this.createPlayerNameInput(startX, startY, data.readOnly);
    }

    if (data?.showPauseButton) {
      const pauseX = data?.showName ? startX + 220 : startX;
      this.pauseButton = this.createIconButton(pauseX, startY, '⏸', 'Пауза', async () => {
        this._gameStateStore.select(selectLobbyName).pipe(take(1)).pipe(takeUntil(this.destroy$)).subscribe(async (roomName) => {
          if (roomName === "") {
            console.warn("Нет названия комнаты в GameStateStore");
            return;
          }
          await this._signalRService.invokeSafe("TogglePause", roomName);
        });
      });
    }
  }

  private createRightControls() {
    const startX = this.scale.width - 25;
    const buttonSpacing = 45;

    this.fullscreenButton = this.createIconButton(
      startX - buttonSpacing * 0,
      25,
      '🖵',
      'Полный экран',
      () => {
        if (!this.scale.isFullscreen) {
          this.scale.startFullscreen();
        } else {
          this.scale.stopFullscreen();
        }
      }
    );

    const isMusicMuted = this._phaserMusicService.getSettings().musicMuted;
    this.musicButton = this.createToggleButton(
      startX - buttonSpacing * 1,
      25,
      '🎵',
      'Музыка',
      isMusicMuted,
      () => {
        this._phaserMusicService.toggleMusic();
        const isMuted = this._phaserMusicService.getSettings().musicMuted;
        this.updateToggleButtonState(this.musicButton!, isMuted);
      }
    );

    const isSoundsMuted = this._phaserMusicService.getSettings().soundsMuted;
    this.soundsButton = this.createToggleButton(
      startX - buttonSpacing * 2,
      25,
      '🔊',
      'Звуки',
      isSoundsMuted,
      () => {
        this._phaserMusicService.toggleSounds();
        const isMuted = this._phaserMusicService.getSettings().soundsMuted;
        this.updateToggleButtonState(this.soundsButton!, isMuted);
      }
    );

    [this.fullscreenButton, this.musicButton, this.soundsButton].forEach(button => {
      button?.setDepth(1001);
    });
  }

  private createPlayerNameInput(x: number, y: number, readOnly?: boolean) {
    const minWidth = 160;
    const maxWidth = 250;
    const inputHeight = 32;

    const labelArea = 55;
    const buttonSpacing = 8;
    const paddingRight = 8;

    let currentWidth = minWidth;

    const bg = this.add.graphics();
    const drawBg = (width: number) => {
      bg.clear();
      bg.fillStyle(0x223344, 0.7);
      bg.fillRoundedRect(x, y - inputHeight / 2, width, inputHeight, 16);
      bg.lineStyle(1.5, 0x4488ff, 0.8);
      bg.strokeRoundedRect(x, y - inputHeight / 2, width, inputHeight, 16);
    };
    drawBg(currentWidth);
    bg.setDepth(1001);

    const labelText = this.add.text(x + 10, y, "👤 Ник:", {
      fontSize: "13px",
      fontFamily: "Arial",
      color: "#aaccff"
    }).setOrigin(0, 0.5).setDepth(1002);

    this.playerNameInput = this.rexUI.add.inputText({
      x: x + labelArea,
      y: y,
      width: minWidth - labelArea - paddingRight,
      height: inputHeight - 6,
      type: "text",
      fontSize: "14px",
      fontFamily: "Courier New",
      color: "#ffffff",
      backgroundColor: "transparent",
      placeholder: "Имя",
      maxLength: 15,
      readOnly: !!readOnly,
    }).setOrigin(0, 0.5).setDepth(1002);

    if (!readOnly) {
      this.generateButton = this.createIconButton(
        x + currentWidth + buttonSpacing,
        y,
        "🎲",
        "Случайное имя",
        () => {
          this._playerSettingsStore.dispatch(generateRandomName());
          this._phaserMusicService.playSound(SoundsTrack.InterfaceClick);
        }
      );
      this.generateButton.setDepth(1002);
    }

    const resizePlayerNameInput = (text: string) => {
      const textWidth = Math.max(text.length * 9, 8);
      const newWidth = Phaser.Math.Clamp(
        labelArea + textWidth + paddingRight,
        minWidth,
        maxWidth
      );

      if (newWidth !== currentWidth) {
        currentWidth = newWidth;
      }

      drawBg(currentWidth);

      if (this.playerNameInput) {
        const domNode = (this.playerNameInput as any).node as HTMLInputElement;
        if (domNode) {
          const inputWidth = currentWidth - labelArea - paddingRight;
          domNode.style.width = `${inputWidth}px`;
        }
      }

      if (this.generateButton) {
        this.generateButton.setX(x + currentWidth + buttonSpacing + 12);
      }
    };

    this._playerSettingsStore.select(selectPlayerName).pipe(takeUntil(this.destroy$)).subscribe((playerName) => {
      if (this.playerNameInput) {
        const name = playerName ?? '';
        this.playerNameInput.text = name;
        resizePlayerNameInput(name);
      }
    });

    if (!readOnly) {
      this.playerNameInput?.on("textchange", (input: InputText) => {
        const text = String(input.text ?? "");
        resizePlayerNameInput(text);
        this._playerSettingsStore.dispatch(setPlayerName({ name: text }));
      });

      this.playerNameInput?.setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          bg.clear();
          bg.fillStyle(0x334455, 0.8);
          bg.fillRoundedRect(x, y - inputHeight / 2, currentWidth, inputHeight, 16);
          bg.lineStyle(1.5, 0x66aaff, 1);
          bg.strokeRoundedRect(x, y - inputHeight / 2, currentWidth, inputHeight, 16);
        })
        .on('pointerout', () => {
          drawBg(currentWidth);
        });
    }

    this._playerSettingsStore.select(selectPlayerName).pipe(take(1)).subscribe((initialName) => {
      resizePlayerNameInput(initialName ?? "");
    });
  }

  private createIconButton(x: number, y: number, icon: string, tooltip: string, callback: Function): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const size = 32;

    const bg = this.add.graphics();
    this.drawButtonBg(bg, size, false);

    const iconText = this.add.text(0, 0, icon, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, iconText]);

    const hitArea = new Phaser.Geom.Rectangle(-size/2, -size/2, size, size);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    (container as any).buttonData = {
      bg: bg,
      iconText: iconText,
      tooltip: tooltip,
      isToggle: false,
      isActive: false,
      currentTooltip: null
    };

    container.on('pointerover', () => {
      const data = (container as any).buttonData;
      this.drawButtonBg(data.bg, size, true);

      if (data.currentTooltip) {
        data.currentTooltip.destroy();
      }

      data.currentTooltip = this.add.text(x, y + 30, data.tooltip, {
        fontSize: '11px',
        fontFamily: 'Arial',
        color: '#aaccff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setDepth(1003);

      this._phaserMusicService.playSound(SoundsTrack.InterfaceHover);
    });

    container.on('pointerout', () => {
      const data = (container as any).buttonData;
      this.drawButtonBg(data.bg, size, false);

      if (data.currentTooltip) {
        data.currentTooltip.destroy();
        data.currentTooltip = null;
      }
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 80,
        yoyo: true
      });

      callback();
      this._phaserMusicService.playSound(SoundsTrack.InterfaceClick);
    });

    return container;
  }

  private createToggleButton(x: number, y: number, icon: string, tooltip: string, isActive: boolean, callback: Function): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const size = 32;

    const bg = this.add.graphics();
    this.drawToggleButtonBg(bg, size, isActive, false);

    const iconText = this.add.text(0, 0, icon, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: isActive ? '#ff6666' : '#88ff88'
    }).setOrigin(0.5);

    container.add([bg, iconText]);

    const hitArea = new Phaser.Geom.Rectangle(-size/2, -size/2, size, size);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    (container as any).buttonData = {
      bg: bg,
      iconText: iconText,
      tooltip: tooltip,
      isToggle: true,
      isActive: isActive,
      currentTooltip: null
    };

    container.on('pointerover', () => {
      const data = (container as any).buttonData;
      this.drawToggleButtonBg(data.bg, size, data.isActive, true);
      this._phaserMusicService.playSound(SoundsTrack.InterfaceHover);

      if (data.currentTooltip) {
        data.currentTooltip.destroy();
      }

      const stateText = data.isActive ? ' (Выкл)' : ' (Вкл)';
      data.currentTooltip = this.add.text(x, y + 30, data.tooltip + stateText, {
        fontSize: '11px',
        fontFamily: 'Arial',
        color: '#aaccff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setDepth(1003);
    });

    container.on('pointerout', () => {
      const data = (container as any).buttonData;
      this.drawToggleButtonBg(data.bg, size, data.isActive, false);

      if (data.currentTooltip) {
        data.currentTooltip.destroy();
        data.currentTooltip = null;
      }
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 80,
        yoyo: true
      });

      callback();
      this._phaserMusicService.playSound(SoundsTrack.InterfaceClick);
    });

    return container;
  }

  private drawButtonBg(graphics: Phaser.GameObjects.Graphics, size: number, isHovered: boolean) {
    graphics.clear();

    const bgColor = isHovered ? 0x334455 : 0x223344;
    const borderColor = isHovered ? 0x66aaff : 0x4488ff;
    const alpha = isHovered ? 0.9 : 0.7;

    graphics.fillStyle(bgColor, alpha);
    graphics.fillCircle(0, 0, size/2);
    graphics.lineStyle(2, borderColor, 0.8);
    graphics.strokeCircle(0, 0, size/2);
  }

  private drawToggleButtonBg(graphics: Phaser.GameObjects.Graphics, size: number, isActive: boolean, isHovered: boolean) {
    graphics.clear();

    const bgColor = isActive ? 0x552222 : 0x225522;
    const borderColor = isActive ? 0xff6666 : 0x88ff88;
    const alpha = isHovered ? 0.9 : 0.7;

    graphics.fillStyle(bgColor, alpha);
    graphics.fillCircle(0, 0, size/2);
    graphics.lineStyle(2, borderColor, 0.8);
    graphics.strokeCircle(0, 0, size/2);
  }

  private updateToggleButtonState(button: Phaser.GameObjects.Container, isActive: boolean) {
    const data = (button as any).buttonData;
    if (!data) return;

    data.isActive = isActive;

    this.drawToggleButtonBg(data.bg, 32, isActive, false);
    data.iconText.setColor(isActive ? '#ff6666' : '#88ff88');

    if (data.currentTooltip && data.currentTooltip.active) {
      const stateText = isActive ? ' (Выкл)' : ' (Вкл)';
      data.currentTooltip.setText(data.tooltip + stateText);
    }
  }

  shutDownListener() {
    this.destroy$.next();
    this.destroy$ = new Subject<void>();
  }
}
