import * as Phaser from 'phaser';
import { Store } from '@ngrx/store';
import { JoinLobbyState } from '../store/join-lobby/join-lobby.state';
import * as JoinLobbyActions from '../../game-logic/store/join-lobby/join-lobby.actions';
import { PhaserInputText } from '../../phaser-ui/phaser-input-text';
import { Subject, take, takeUntil } from "rxjs";
import { PlayerSettingsState } from "../store/player-settings/player-settings.reducer";
import { selectPlayerName } from "../store/player-settings/player-settings.selectors";
import { resetJoinLobby } from '../store/join-lobby/join-lobby.actions';
import * as LobbyActions from "../store/lobby/lobby.actions";
import { LobbyState } from "../store/lobby/lobby.state";

export class JoinLobbyScene extends Phaser.Scene {
  private joinButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;
  private inputField!: PhaserInputText;

  private store!: Store<{ joinLobby: JoinLobbyState }>;
  private _playerSettingsStore!: Store<{ playerSettings: PlayerSettingsState }>;
  private lobbyStore!: Store<{ lobby: LobbyState }>;

  private destroy$ = new Subject<void>();

  constructor() {
    super({ key: 'JoinLobbyScene' });
  }

  create() {
    this.scene.launch('UIOverlayScene', { showPauseButton: false, showName: true, readOnly: true });

    this.store = this.registry.get('joinLobbyStore');
    this._playerSettingsStore = this.registry.get('playerSettingsStore');
    this.lobbyStore = this.registry.get('lobbyStore');

    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a1a');

    this.add.text(width / 2, height / 8, 'Присоединиться к лобби', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.inputField = new PhaserInputText(this, width / 2, height / 3, 'Введите название лобби');

    this.joinButton = this.createButtonElement(width / 2, height * 0.6, 'Присоединиться', async () => {
      const lobbyName = this.inputField.getValue();
      if (!lobbyName) {
        alert('Введите название лобби');
        return;
      }

      this._playerSettingsStore.select(selectPlayerName).pipe(take(1)).pipe(takeUntil(this.destroy$)).subscribe((playerName) => {
        //this.store.dispatch(JoinLobbyActions.setLobbyName({ name: lobbyName }));
        this.store.dispatch(JoinLobbyActions.joinLobby({ name: lobbyName, playerName }));
      });
    });

    this.backButton = this.createButtonElement(width / 2, height * 0.7, 'Назад в меню', () => {
      this.scene.start('MainMenuScene');
    });

    this.store.select('joinLobby').pipe(takeUntil(this.destroy$)).subscribe(state => {
      if (state.loading) this.joinButton.setText('Подключение...');
      else this.joinButton.setText('Присоединиться');

      if (state.error) {
        alert(state.error);
        return;
      }

      if (!state.loading && !state.error && state.lobbyName) {
        this.lobbyStore.dispatch(LobbyActions.setLobbyParams({
          lobbyName: state.lobbyName,
          playerName: state.playerName,
          maxPlayers: 4 // TODO Пока хардкод
        }));
        this.scene.start('LobbyScene', { lobbyName: state.lobbyName });
      }
    });

    this.events.once('shutdown', this.shutDownListener, this);
  }

  createButtonElement(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, text, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#333333' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#000000' }));
    button.on('pointerdown', callback);

    return button;
  }

  shutDownListener() {
    this.store.dispatch(resetJoinLobby());
    this.destroy$.next(); // гасим все подписки текущего запуска
    this.destroy$ = new Subject<void>(); // создаём новый на следующий цикл жизни
    //TODO Очистить состояния в NgRx
    //this.destroy$.complete();
    console.log("joinLobby shutdown");
  }
}
