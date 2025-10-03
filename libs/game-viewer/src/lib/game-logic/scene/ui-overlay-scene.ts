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

    const { width, height } = this.scale;

    // Создаём минималистичную верхнюю панель
    this.createTopPanel(width);

    // Элементы управления слева
    this.createLeftControls(data);

    // Элементы управления справа
    this.createRightControls();

    this.events.once('shutdown', this.shutDownListener, this);
  }

  private createTopPanel(width: number) {
    const panel = this.add.graphics();
    // Минималистичная полупрозрачная панель
    panel.fillStyle(0x0a0a1a, 0.7);
    panel.fillRect(0, 0, width, 50);

    // Тонкая линия разделитель
    panel.lineStyle(1, 0x4488ff, 0.4);
    panel.lineBetween(0, 50, width, 50);

    panel.setDepth(1000);
  }

  private createLeftControls(data?: UIOverlayData) {
    const startX = 15;
    const startY = 25;

    // Поле ввода имени игрока (компактное)
    if (data?.showName) {
      this.createCompactPlayerNameInput(startX, startY, data.readOnly);
    }

    // Кнопка паузы (если нужна)
    if (data?.showPauseButton) {
      const pauseX = data?.showName ? startX + 220 : startX;
      this.pauseButton = this.createCompactIconButton(pauseX, startY, '⏸', 'Пауза', async () => {
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

    // Кнопка полноэкранного режима (с короткой подсказкой)
    this.fullscreenButton = this.createCompactIconButton(
      startX - buttonSpacing * 0,
      25,
      '🖵',
      'Fullscreen', // Короткая подсказка на английском
      () => {
        if (!this.scale.isFullscreen) {
          this.scale.startFullscreen();
        } else {
          this.scale.stopFullscreen();
        }
      }
    );

    // Кнопка музыки
    const isMusicMuted = this._phaserMusicService.getSettings().musicMuted;
    this.musicButton = this.createCompactToggleButton(
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

    // Кнопка звуков
    const isSoundsMuted = this._phaserMusicService.getSettings().soundsMuted;
    this.soundsButton = this.createCompactToggleButton(
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

    // Устанавливаем глубину для всех кнопок
    [this.fullscreenButton, this.musicButton, this.soundsButton].forEach(button => {
      button?.setDepth(1001);
    });
  }

  private createCompactPlayerNameInput(x: number, y: number, readOnly?: boolean) {
    // Компактный фон для поля ввода
    const inputBg = this.add.graphics();
    inputBg.fillStyle(0x112233, 0.6);
    inputBg.fillRoundedRect(x - 8, y - 18, 180, 36, 6);
    inputBg.lineStyle(1, 0x4488ff, 0.5);
    inputBg.strokeRoundedRect(x - 8, y - 18, 180, 36, 6);
    inputBg.setDepth(1001);

    // Компактное поле ввода имени
    this.playerNameInput = this.rexUI.add.inputText({
      x: x,
      y: y,
      width: 120,
      height: 30,
      type: 'text',
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      backgroundColor: 'transparent',
      border: 0,
      placeholder: 'Имя...',
      maxLength: 15,
      readOnly: !!readOnly,
    }).setOrigin(0, 0.5).setDepth(1002);

    this._playerSettingsStore.select(selectPlayerName).pipe(takeUntil(this.destroy$)).subscribe((playerName) => {
      if (this.playerNameInput) {
        this.playerNameInput.text = playerName ?? '';
      }
    });

    if (!readOnly) {
      this.playerNameInput.on('textchange', (input: InputText) => {
        this._playerSettingsStore.dispatch(setPlayerName({ name: String(input.text) }));
      });

      // Компактная кнопка генерации ника
      this.generateButton = this.createCompactIconButton(
        x + 140,
        y,
        '🎲',
        'Случайное имя',
        () => {
          this._playerSettingsStore.dispatch(generateRandomName());
          this._phaserMusicService.playSound(SoundsTrack.InterfaceClick);
        }
      );
      this.generateButton.setDepth(1002);
    }
  }

  private createCompactIconButton(x: number, y: number, icon: string, tooltip: string, callback: Function): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const size = 32;

    // Фон кнопки
    const bg = this.add.graphics();
    this.drawCompactButtonBg(bg, size, false);

    // Иконка
    const iconText = this.add.text(0, 0, icon, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, iconText]);

    // Область взаимодействия
    const hitArea = new Phaser.Geom.Rectangle(-size/2, -size/2, size, size);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // Сохраняем данные кнопки
    (container as any).buttonData = {
      bg: bg,
      iconText: iconText,
      tooltip: tooltip,
      isToggle: false,
      isActive: false,
      currentTooltip: null // Ссылка на текущий тултип
    };

    // Тултип
    container.on('pointerover', () => {
      const data = (container as any).buttonData;
      this.drawCompactButtonBg(data.bg, size, true);

      // Удаляем старый тултип если есть
      if (data.currentTooltip) {
        data.currentTooltip.destroy();
      }

      // Создаем новый тултип с минимальным шрифтом
      data.currentTooltip = this.add.text(x, y + 30, data.tooltip, {
        fontSize: '10px', // Еще меньше шрифт для компактности
        fontFamily: 'Arial',
        color: '#aaccff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
      }).setOrigin(0.5).setDepth(1003);

      this._phaserMusicService.playSound(SoundsTrack.InterfaceHover);
    });

    container.on('pointerout', () => {
      const data = (container as any).buttonData;
      this.drawCompactButtonBg(data.bg, size, false);

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

  private createCompactToggleButton(x: number, y: number, icon: string, tooltip: string, isActive: boolean, callback: Function): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const size = 32;

    // Фон кнопки
    const bg = this.add.graphics();
    this.drawCompactToggleButtonBg(bg, size, isActive, false);

    // Иконка
    const iconText = this.add.text(0, 0, icon, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: isActive ? '#ff6666' : '#88ff88'
    }).setOrigin(0.5);

    container.add([bg, iconText]);

    // Область взаимодействия
    const hitArea = new Phaser.Geom.Rectangle(-size/2, -size/2, size, size);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // Сохраняем данные кнопки
    (container as any).buttonData = {
      bg: bg,
      iconText: iconText,
      tooltip: tooltip,
      isToggle: true,
      isActive: isActive,
      currentTooltip: null // Ссылка на текущий тултип
    };

    // Тултип
    container.on('pointerover', () => {
      const data = (container as any).buttonData;
      this.drawCompactToggleButtonBg(data.bg, size, data.isActive, true);
      this._phaserMusicService.playSound(SoundsTrack.InterfaceHover);

      // Удаляем старый тултип если есть
      if (data.currentTooltip) {
        data.currentTooltip.destroy();
      }

      // Создаем новый тултип с актуальным состоянием и минимальным шрифтом
      const stateText = data.isActive ? ' (Выкл)' : ' (Вкл)';
      data.currentTooltip = this.add.text(x, y + 30, data.tooltip + stateText, {
        fontSize: '10px', // Еще меньше шрифт для компактности
        fontFamily: 'Arial',
        color: '#aaccff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
      }).setOrigin(0.5).setDepth(1003);
    });

    container.on('pointerout', () => {
      const data = (container as any).buttonData;
      this.drawCompactToggleButtonBg(data.bg, size, data.isActive, false);

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

  private drawCompactButtonBg(graphics: Phaser.GameObjects.Graphics, size: number, isHovered: boolean) {
    graphics.clear();

    const bgColor = isHovered ? 0x334455 : 0x223344;
    const borderColor = isHovered ? 0x66aaff : 0x4488ff;
    const alpha = isHovered ? 0.9 : 0.7;

    graphics.fillStyle(bgColor, alpha);
    graphics.fillCircle(0, 0, size/2);
    graphics.lineStyle(2, borderColor, 0.8);
    graphics.strokeCircle(0, 0, size/2);
  }

  private drawCompactToggleButtonBg(graphics: Phaser.GameObjects.Graphics, size: number, isActive: boolean, isHovered: boolean) {
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

    // Обновляем состояние
    data.isActive = isActive;

    // Обновляем внешний вид
    this.drawCompactToggleButtonBg(data.bg, 32, isActive, false);
    data.iconText.setColor(isActive ? '#ff6666' : '#88ff88');

    // Если тултип сейчас отображается - обновляем его
    if (data.currentTooltip && data.currentTooltip.active) {
      const stateText = isActive ? ' (Выкл)' : ' (Вкл)';
      data.currentTooltip.setText(data.tooltip + stateText);
    }
  }

  shutDownListener() {
    this.destroy$.next();
    this.destroy$ = new Subject<void>();
    console.log("ui overlay shutdown");
  }
}
