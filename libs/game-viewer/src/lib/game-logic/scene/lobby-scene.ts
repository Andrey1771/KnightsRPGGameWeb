import * as Phaser from 'phaser';
import { SignalRService } from '../../services/signal-r-service/signal-r-service';
import { Store } from '@ngrx/store';
import { GameState } from '../store/game/game.state';
import { Subject, take, takeUntil } from 'rxjs';
import { PlayerInfo } from '../../models/player-info';
import { resetLobby, setLobbyName } from "../store/lobby/lobby.actions";
import {selectLobbyName} from "../store/lobby/lobby.selectors";

export class LobbyScene extends Phaser.Scene {
  private playerListTexts: Phaser.GameObjects.Text[] = [];
  private startButton!: Phaser.GameObjects.Text;
  private lobbyNameText!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;

  private signalR!: SignalRService;
  private store!: Store<GameState>;

  private destroy$ = new Subject<void>();

  constructor() {
    super({ key: 'LobbyScene' });
  }

  async create(data: { lobbyName: string }) {
    this.signalR = this.registry.get('signalR');
    this.store = this.registry.get('lobbyStore');

    this.store.dispatch(setLobbyName({ name: data.lobbyName })); //TODO Переделать в одно хранилище

    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#1a1a1a');



    const startX = this.scale.width / 2;
    const startY = this.scale.height * 0.3;

    this.add.text(startX, startY - 40, 'Игроки:', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.backButton = this.createButtonElement(width / 2, height * 0.8, 'Назад в меню', () => {
      this.backButton.destroy();
      this.store.dispatch(resetLobby());
      this.signalR.stopConnection();
      this.scene.start('MainMenuScene');
    });




    this.startButton = this.createButtonElement(width / 2, height * 0.7, 'Начать игру', async () => {
        try {
          await this.signalR.invokeSafe("StartGame", data.lobbyName);
        } catch (err) {
          console.error("Ошибка при старте игры:", err);
        }
      });

    this.lobbyNameText = this.add.text(width / 2, height / 8, `Лобби:`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.store.select(state => state.lobby).pipe(takeUntil(this.destroy$)).subscribe(async lobby => {
      console.log("leaderConnectionId:", lobby.leaderConnectionId, typeof lobby.leaderConnectionId);
      console.log("connectionId:", this.signalR.connectionId, typeof this.signalR.connectionId);
      if (!this.signalR.connectionId && !lobby.leaderConnectionId) {
        return; // пока нет id, ничего не показываем
      }

      this.lobbyNameText.text = `Лобби: ${lobby.lobbyName}`;

      // обновляем UI
      //this.updatePlayersUI(lobby.players, lobby.leaderConnectionId ?? "");
      const leaderId = lobby.leaderConnectionId ?? "";
      const connId = this.signalR.connectionId ?? "";
      this.updatePlayerList(lobby.players, connId, leaderId);
      this.updateLeaderUI(connId, leaderId);
      //this.startButton.setVisible(leaderId !== "" && leaderId === connId);
      if (lobby.gameStarted) {
        this.scene.start('MultiplayerScene');
      }
    });
    await this.signalR.invokeSafe("GetPlayerList", data.lobbyName); // TODO Переделать на NgRx

    this.events.once('shutdown', this.shutDownListener, this);
  }

  /*updatePlayersUI(players: any[], leaderConnectionId: string) {
    this.playerListTexts.forEach(t => t.destroy());
    this.playerListTexts = [];
    players.forEach((p, i) => {
      const y = this.scale.height * 0.3 + i * 40;
      const text = this.add.text(this.scale.width/2, y, p.name, { fontSize: '24px', color: p.connectionId === leaderConnectionId ? '#ffcc00' : '#00ff00' }).setOrigin(0.5);
      this.playerListTexts.push(text);
    });
  }*/







  updatePlayerList(playerInfos: PlayerInfo[], currentConnectionId: string, leaderConnectionId: string) {
    // Удаляем старые элементы
    this.playerListTexts.forEach(text => text.destroy());
    this.playerListTexts = [];

    const startX = this.scale.width / 2;
    const startY = this.scale.height * 0.3;

    playerInfos.forEach((player, index) => {
      const isLeader = player.connectionId === leaderConnectionId;
      const color = isLeader ? '#ffcc00' : '#00ff00';
      const leaderIcon = isLeader ? ' 🔰' : '';

      // Текст игрока
      const y = startY + index * 40;
      const playerText = this.add.text(
        startX,
        y,
        `${player.name}${leaderIcon}`,
        {
          fontSize: '24px',
          fontFamily: 'Arial',
          color
        }
      ).setOrigin(0.5);

      this.playerListTexts.push(playerText);

      // Если текущий игрок — лидер, добавляем кнопку "Сделать лидером" для других игроков
      if (this.signalR.connectionId === leaderConnectionId && !isLeader) {
        const makeLeaderButton = this.add.text(startX + 200, y, 'Сделать лидером', {
          fontSize: '20px',
          fontFamily: 'Arial',
          color: '#ffffff',
          backgroundColor: '#444444',
          padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        makeLeaderButton.on('pointerover', () => makeLeaderButton.setStyle({ backgroundColor: '#666666' }));
        makeLeaderButton.on('pointerout', () => makeLeaderButton.setStyle({ backgroundColor: '#444444' }));
        makeLeaderButton.on('pointerdown', () => {
          this.store.select(selectLobbyName).pipe(take(1)).pipe(takeUntil(this.destroy$)).subscribe(async lobbyName => {
            this.signalR.invokeSafe("ChangeLeader", lobbyName, player.connectionId)
              .catch(err => console.error("Ошибка смены лидера:", err));
          });
        });

        this.playerListTexts.push(makeLeaderButton);
      }
    });
  }

  private updateLeaderUI(currentConnectionId: string, leaderConnectionId: string) {
    if (currentConnectionId === leaderConnectionId) {
      this.startButton.setVisible(true);
    } else {
      this.startButton.setVisible(false);
    }
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
    this.destroy$.next(); // гасим все подписки текущего запуска
    this.destroy$ = new Subject<void>(); // создаём новый на следующий цикл жизни
    //this.destroy$.complete();
    console.log("lobby shutdown");
  }
}
