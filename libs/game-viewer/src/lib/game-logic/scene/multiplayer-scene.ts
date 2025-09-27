import * as Phaser from 'phaser';
import { Store } from '@ngrx/store';
import { MultiplayerState } from '../store/multiplayer/multiplayer.state';
import { SignalRService } from "../../services/signal-r-service/signal-r-service";
import { MusicTrack, PhaserMusicService, SoundsTrack } from "../../services/phaser-music-service/phaser-music-service";
import {Subject, take, takeUntil} from 'rxjs';
import {PlayerPositionDto} from "../../dto/player-position-dto";

import * as MultiplayerActions from '../../game-logic/store/multiplayer/multiplayer.actions';
import { resetAll } from '../store/global/global.actions';
import {selectLobbyName} from "../store/lobby/lobby.selectors";
import {GameState} from "../store/game/game.state";
import {selectGameOver, selectMultiplayerState} from '../store/multiplayer/multiplayer.selectors';

export class MultiplayerScene extends Phaser.Scene {
  private _playerSprite!: Phaser.GameObjects.Sprite;
  private _remotePlayers: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private _bots: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private _bullets: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private _enemyBullets: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private _healthTexts: Map<string, Phaser.GameObjects.Text> = new Map();

  private _playerHealthText!: Phaser.GameObjects.Text;
  private _scoreText!: Phaser.GameObjects.Text;
  private fpsText!: Phaser.GameObjects.Text;

  private _pauseOverlay?: Phaser.GameObjects.Rectangle;
  private _pausePanel?: Phaser.GameObjects.Rectangle;
  private _pauseContinueButton?: Phaser.GameObjects.Text;
  private _pauseMenuButton?: Phaser.GameObjects.Text;
  private _pauseText?: Phaser.GameObjects.Text;

  private store!: Store<{ multiplayer: MultiplayerState }>;
  private _gameStateStore!: Store<GameState>;
  private signalRService!: SignalRService;
  private phaserMusicService!: PhaserMusicService;

  private destroy$ = new Subject<void>();

  constructor() {
    super({ key: 'MultiplayerScene' });
  }

  create() {
    this.store = this.registry.get('multiplayerStore');
    this.signalRService = this.registry.get('signalR');
    this.phaserMusicService = this.registry.get('musicService');
    this._gameStateStore = this.registry.get('lobbyStore');//TODO Ошибка брать lobbyStore?

    this.scene.launch('UIOverlayScene', { showPauseButton: true, showName: false, readOnly: true });
    this.scene.launch('SpaceBackgroundScene');
    this.scene.sendToBack('SpaceBackgroundScene');

    this._setupControls();
    this._setupUI();
    this.phaserMusicService.playMusic(MusicTrack.BattleTheme);

    this.signalRService.playerHit$.pipe(takeUntil(this.destroy$)).subscribe(({ id, health }) => {
      this._handlePlayerHit(id, health);
    });

    // подписка на смерти
    this.signalRService.playerDied$.pipe(takeUntil(this.destroy$)).subscribe(({ id }) => {
      this._handlePlayerDeath(id);
    });

    this.signalRService.botDied$.pipe(takeUntil(this.destroy$)).subscribe(({ id }) => {
      this.store.dispatch(MultiplayerActions.botDied({ id }));
      this.phaserMusicService.playSound(SoundsTrack.EnemyShipExplosion);
      this._removeBotSprite(id);
    });

    this.store.select(selectGameOver).subscribe((isGameOver) => {
      if (isGameOver) {
        const score = Number(this._scoreText.text.replace('Score: ', ''));
        this.scene.launch('GameOverScene', { score });
      }
    });

    // Подписка на состояние через Store
    this.store.select(selectMultiplayerState).pipe(takeUntil(this.destroy$)).subscribe(state => {
      // синхронизация сущностей
      this._syncPlayers(state.players);
      this._syncBots(state.bots);
      this._syncBullets(state.bullets, false);
      this._syncBullets(state.enemyBullets, true);
      this._scoreText.setText(`Score: ${state.score.toFixed(0)}`);

      if (state.isPaused) this._showPauseMenu();
      else this._hidePauseMenu();

      if (state.gameOver) this._showGameOverMenu(state.score);
    });

    this.events.once('shutdown', this.shutDownListener, this);
  }


  private _setupControls() {
    const cursors = this.input.keyboard?.createCursorKeys();
    const keysDown = new Set<string>();

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (keysDown.has(event.code)) return;
      keysDown.add(event.code);

      switch (event.code) {
        case 'ArrowUp': this.signalRService.invokeSafe("PerformAction", "MoveUp"); break;
        case 'ArrowDown': this.signalRService.invokeSafe("PerformAction", "MoveDown"); break;
        case 'ArrowLeft': this.signalRService.invokeSafe("PerformAction", "MoveLeft"); break;
        case 'ArrowRight': this.signalRService.invokeSafe("PerformAction", "MoveRight"); break;
        case 'Space': this.signalRService.invokeSafe("Shoot"); break;
      }
    });

    this.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
      if (!keysDown.has(event.code)) return;
      keysDown.delete(event.code);

      switch (event.code) {
        case 'ArrowUp': this.signalRService.invokeSafe("PerformAction", "StopMoveUp"); break;
        case 'ArrowDown': this.signalRService.invokeSafe("PerformAction", "StopMoveDown"); break;
        case 'ArrowLeft': this.signalRService.invokeSafe("PerformAction", "StopMoveLeft"); break;
        case 'ArrowRight': this.signalRService.invokeSafe("PerformAction", "StopMoveRight"); break;
      }
    });
  }

  private _setupUI() {
    this._playerSprite = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'player').setScale(0.25);

    this._playerHealthText = this.add.text(16, 16, 'HP: 100', {
      font: '20px Arial', color: '#ffffff', backgroundColor: '#000000', padding: { x: 6, y: 4 }
    }).setScrollFactor(0);

    this._scoreText = this.add.text(this.scale.width - 150, 16, 'Score: 0', {
      font: '20px Arial', color: '#ffffff', backgroundColor: '#000000', padding: { x: 6, y: 4 }
    }).setScrollFactor(0).setOrigin(1, 0);

    this.fpsText = this.add.text(10, 10, '', { font: '16px Courier' });
  }

  private _syncPlayers(players: Record<string, PlayerPositionDto>) {
    Object.entries(players).forEach(([id, pos]) => {
      if (id === this.signalRService.connectionId) {
        this._playerSprite.setPosition(pos.x, pos.y);
        this._playerHealthText.setText(`HP: ${pos.health}`);
      } else {
        let sprite = this._remotePlayers.get(id);
        if (!sprite) {
          sprite = this.add.sprite(pos.x, pos.y, 'player').setScale(0.25).setTint(0x00ff00);
          this._remotePlayers.set(id, sprite);
        } else sprite.setPosition(pos.x, pos.y);

        let healthText = this._healthTexts.get(id);
        if (!healthText) {
          healthText = this.add.text(pos.x, pos.y - 50, `HP: ${pos.health}`, {
            font: '16px Arial', color: '#ffffff', backgroundColor: '#000000', padding: { x: 4, y: 2 }
          });
          this._healthTexts.set(id, healthText);
        } else {
          healthText.setText(`HP: ${pos.health}`);
          healthText.setPosition(pos.x - healthText.width / 2, pos.y - 50);
        }
      }
    });
  }

  private _syncBots(bots: Record<string, PlayerPositionDto>) {
    Object.entries(bots).forEach(([id, pos]) => {
      let sprite = this._bots.get(id);
      if (!sprite) {
        const texture = ['enemy_0', 'enemy_1', 'enemy_2'][pos.shootingStyle] || 'enemy_0';
        sprite = this.add.sprite(pos.x, pos.y, texture).setRotation(Math.PI).setScale(0.25);
        this._bots.set(id, sprite);
      } else {
        sprite.setPosition(pos.x, pos.y);
      }
    });
  }

  private _removeBotSprite(id: string) {
    const sprite = this._bots.get(id);
    if (sprite) {
      sprite.destroy();
      this._bots.delete(id);
    }
  }

  private _syncBullets(bullets: Record<string, any>, isEnemy = false) {
    const targetMap = isEnemy ? this._enemyBullets : this._bullets;

    // Создаем/обновляем спрайты пуль
    Object.entries(bullets).forEach(([id, b]) => {
      let sprite = targetMap.get(id);
      if (!sprite) {
        sprite = this.add.rectangle(b.x, b.y, 5, 10, isEnemy ? 0xff0000 : 0xffffff);
        this.physics.add.existing(sprite);
        targetMap.set(id, sprite);
      } else {
        sprite.setPosition(b.x, b.y);
      }
    });

    // Удаляем пули, которых больше нет в state
    targetMap.forEach((sprite, id) => {
      if (!bullets[id]) {
        sprite.destroy();
        targetMap.delete(id);
      }
    });
  }

  private _handlePlayerHit(playerId: string, health: number) {
    const isLocal = playerId === this.signalRService.connectionId;
    const sprite = isLocal ? this._playerSprite : this._remotePlayers.get(playerId);

    if (sprite) {
      sprite.setTint(0xff0000);
      this.time.delayedCall(500, () => sprite.clearTint());
    }

    if (isLocal) {
      this._playerHealthText.setText(`HP: ${health}`);
    }
  }

  private _handlePlayerDeath(playerId: string) {
    if (playerId === this.signalRService.connectionId) {
      this._playerSprite.setVisible(false);
      this.input.enabled = false;
    } else {
      const remote = this._remotePlayers.get(playerId);
      if (remote) remote.setVisible(false);
    }
    this.phaserMusicService.playSound(SoundsTrack.PlayerShipExplosion);
  }

  private _showPauseMenu() {
    if (!this._pauseOverlay) {
      const { width, height } = this.scale;
      this._pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
      this._pausePanel = this.add.rectangle(width / 2, height / 2, 400, 200, 0x222222, 0.9).setStrokeStyle(2, 0xffffff);
      this._pauseText = this.add.text(width / 2, height / 2 - 60, "Пауза", { font: '28px Arial', color: '#ffffff' }).setOrigin(0.5);

      this._pauseContinueButton = this.add.text(width / 2, height / 2 - 10, "Продолжить", { font: '22px Arial', color: '#fff', backgroundColor: '#444', padding: { x: 20, y: 10 } })
        .setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', async () => {
          this._gameStateStore.select(selectLobbyName).pipe(take(1)).pipe(takeUntil(this.destroy$)).subscribe(async (roomName) => {
            await this.signalRService.invokeSafe("TogglePause", roomName);
          });
        });

      this._pauseMenuButton = this.add.text(width / 2, height / 2 + 50, "В меню", { font: '22px Arial', color: '#fff', backgroundColor: '#444', padding: { x: 20, y: 10 } })
        .setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', async () => {
          await this.signalRService.stopConnection();
          this.scene.stop('MultiplayerScene');
          this.scene.stop('SpaceBackgroundScene');
          this.scene.stop('UIOverlayScene');
          this.scene.start('MainMenuScene');
        });
    }
    [this._pauseOverlay, this._pausePanel, this._pauseText, this._pauseContinueButton, this._pauseMenuButton].forEach(o => o?.setVisible(true));
  }

  private _hidePauseMenu() {
    [this._pauseOverlay, this._pausePanel, this._pauseText, this._pauseContinueButton, this._pauseMenuButton].forEach(o => o?.setVisible(false));
  }

  private _showGameOverMenu(score: number) {
    this.scene.launch('GameOverScene', { score });
  }

  shutDownListener() {
    this.destroy$.next(); // гасим все подписки текущего запуска
    this.destroy$ = new Subject<void>(); // создаём новый на следующий цикл жизни
    //this.destroy$.complete();

    this.input.keyboard?.removeAllListeners(); // TODO нужно заново подписаться?

    this._remotePlayers.forEach(p => p.destroy());
    this._bots.forEach(b => b.destroy());
    this._bullets.forEach(b => b.destroy());
    this._enemyBullets.forEach(b => b.destroy());
    this._healthTexts.forEach(t => t.destroy());
    this._playerSprite.destroy();
    this._playerHealthText.destroy();
    this._scoreText.destroy();
    this.fpsText.destroy();

    this.store.dispatch(resetAll());

    console.log("multiplayer shutdown");
  }

  override update() {
    this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
  }
}
