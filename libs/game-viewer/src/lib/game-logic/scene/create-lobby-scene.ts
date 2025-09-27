import * as Phaser from 'phaser';
import { Store } from '@ngrx/store';
import { CreateLobbyState } from '../store/create-lobby/create-lobby.state';
import * as CreateLobbyActions from '../../game-logic/store/create-lobby/create-lobby.actions';
import { PhaserInputText } from '../../phaser-ui/phaser-input-text';
import {Subject, takeUntil} from 'rxjs';
import {PlayerSettingsState} from "../store/player-settings/player-settings.reducer";
import {selectPlayerName} from "../store/player-settings/player-settings.selectors";
import { resetCreateLobby } from '../store/create-lobby/create-lobby.actions';

export class CreateLobbyScene extends Phaser.Scene {
  private inputField!: PhaserInputText;
  private createButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;
  private playerListTexts: Phaser.GameObjects.Text[] = [];

  private createLobbyStore!: Store<{ createLobby: CreateLobbyState }>;
  private _playerSettingsStore!: Store<{ playerSettings: PlayerSettingsState }>;

  private destroy$ = new Subject<void>();

  constructor() {
    super({ key: 'CreateLobbyScene' });
  }

  create() {

    this.scene.launch('UIOverlayScene', { showPauseButton: false, showName: true, readOnly: true });

    this.createLobbyStore = this.registry.get('createLobbyStore');
    this._playerSettingsStore = this.registry.get('playerSettingsStore');

    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a1a');

    this.add.text(width / 2, height / 8, 'Создание лобби', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.inputField = new PhaserInputText(this, width / 2, height / 4, 'Введите название лобби');

    this._playerSettingsStore.select(selectPlayerName).pipe(takeUntil(this.destroy$)).subscribe((playerName) => {
      this.createButton = this.createButtonElement(width / 2, height * 0.6, 'Создать лобби', async () => {
        const lobbyName = this.inputField.getValue();
        const maxPlayers = 4; // TODO Пока хардкор
        console.log("lobbyName: ", lobbyName);
        //this.createLobbyStore.dispatch(CreateLobbyActions.setLobbyParams({ lobbyName, playerName, maxPlayers }));
        this.createLobbyStore.dispatch(CreateLobbyActions.createLobby({ lobbyName, playerName, maxPlayers }));
      });
    });

    this.backButton = this.createButtonElement(width / 2, height * 0.7, 'Назад в меню', () => {

      this.scene.start('MainMenuScene');
    });

    // Подписка на Store
    this.createLobbyStore.select('createLobby').pipe(takeUntil(this.destroy$)).subscribe(state => {
      //this.createButton.setText(state.loading ? 'Создание...' : 'Создать лобби');

      if (state.error) {
        alert(state.error);
        return;
      }

      if (!state.loading && state.lobbyName) {
        this.inputField.destroy();
        this.scene.start('LobbyScene', { lobbyName: state.lobbyName });
        this.updatePlayerList(state.players ?? []);
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

  updatePlayerList(players: string[]) { //TODO Лишнее??
    this.playerListTexts.forEach(text => text.destroy());
    this.playerListTexts = [];

    const startX = this.scale.width / 2;
    const startY = this.scale.height * 0.35;

    players.forEach((player, index) => {
      const playerText = this.add.text(startX, startY + index * 30, `Игрок ${index + 1}: ${player}`, {
        fontSize: '24px',
        color: '#00ff00'
      }).setOrigin(0.5);
      this.playerListTexts.push(playerText);
    });
  }

  shutDownListener() {
    this.createLobbyStore.dispatch(resetCreateLobby());
    this.destroy$.next(); // гасим все подписки текущего запуска
    this.destroy$ = new Subject<void>(); // создаём новый на следующий цикл жизни
    //TODO Очистить состояния в NgRx
    //this.destroy$.complete();
    console.log("createLobby shutdown");
  }
}
