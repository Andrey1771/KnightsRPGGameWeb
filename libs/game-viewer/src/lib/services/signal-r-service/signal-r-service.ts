import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Store } from '@ngrx/store';
import {
  Subject,
  fromEventPattern,
  Observable,
  of,
  firstValueFrom,
  defer,
  from,
  tap,
  throwError,
  ReplaySubject
} from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import * as MultiplayerActions from '../../game-logic/store/multiplayer/multiplayer.actions';
import * as CreateLobbyActions from '../../game-logic/store/create-lobby/create-lobby.actions';
import * as GlobalActions from '../../game-logic/store/global/global.actions';
import * as LobbyActions from '../../game-logic/store/lobby/lobby.actions';
import { PlayerPositionDto } from '../../dto/player-position-dto';
import { LobbyState } from '../../game-logic/store/lobby/lobby.state';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private destroy$ = new Subject<void>();

  public playerHit$ = new Subject<{ id: string; health: number }>();
  public playerDied$ = new Subject<{ id: string }>();

  public botDied$ = new Subject<{ id: string }>();

  private connectionEstablished$ = new ReplaySubject<void>(1);

  constructor(private store: Store<LobbyState>) {}

  public startConnection(): Observable<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7172/gamehub')
      .withAutomaticReconnect()
      .build();

    return defer(() =>
      from(this.hubConnection.start()).pipe(
        tap(() => {
          console.log('SignalR connected');
          this.registerHandlers();
          this.connectionEstablished$.next();
        }),
        catchError(err => throwError(() => new Error('Ошибка подключения: ' + err)))
      )
    ).pipe(takeUntil(this.destroy$));
  }

  public waitForConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }
    return firstValueFrom(this.connectionEstablished$);
  }

  private registerHandlers() {
    const addHandler = <T>(
      eventName: string,
      actionCreator: (payload: T) => any
    ) => {
      fromEventPattern<T>(
        (handler) => {
          console.log(`eventName: ${eventName}`);
          this.hubConnection.on(eventName, handler);
        },
        (handler) => this.hubConnection.off(eventName, handler)
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe((payload) => {
          try {
            const action = actionCreator(payload);
            this.store.dispatch(action);
          } catch (err) {
            console.log("registerHandlersError: ", err)
          }
        });
    };

    // GameActions
    addHandler('ReceivePlayerList', (dto: any) => {
      console.log('ReceivePlayerList', dto);
      return LobbyActions.updatePlayers({
          players: dto.playerInfos,
          leaderConnectionId: dto.leaderConnectionId,
        })
      }
    );

    addHandler('GameStarted', (data: any) =>
      LobbyActions.startGame({
        initialPositions: data.initialPositions,
        bots: data.bots,
      })
    );

    addHandler('RoomCreated', (data: any) =>
      CreateLobbyActions.createLobbySuccess({ lobbyName: data.roomName, playerName:  data.playerName, maxPlayers:  data.maxPlayers })
    );

    addHandler('Error', (errorMessage: string) =>
      CreateLobbyActions.createLobbyFailure({ error: errorMessage })
    );

    addHandler('Error', (errorMessage: string) =>
      GlobalActions.signalRError({ error: errorMessage })
    );

    // MultiplayerActions
    addHandler('ReceivePlayerPosition', (data: any) =>
      MultiplayerActions.updatePlayerPosition({ id: data[0], pos: data[1] })
    );

    addHandler('PlayerLeft', (id: string) =>
      MultiplayerActions.removePlayer({ id })
    );

    addHandler('ReceiveBotList', (botsPayload: any) => {
      let normalized: Record<string, PlayerPositionDto> = {};
      console.log(botsPayload);
      if (!botsPayload) {
        normalized = {};
      } else if (Array.isArray(botsPayload)) {
        normalized = Object.fromEntries(
          botsPayload.map((b: any) => [
            b.id,
            {
              x: b.x,
              y: b.y,
              health: b.health ?? 100,
              shootingStyle: b.shootingStyle ?? 0
            } as PlayerPositionDto
          ])
        );
      } else if (typeof botsPayload === 'object') {
        normalized = Object.entries(botsPayload).reduce((acc, [id, val]) => {
          const v: any = val;
          acc[id] = {
            x: v.x ?? 0,
            y: v.y ?? 0,
            health: v.health ?? 100,
            shootingStyle: v.shootingStyle ?? 0
          } as PlayerPositionDto;
          return acc;
        }, {} as Record<string, PlayerPositionDto>);
      }

      return MultiplayerActions.setBots({ bots: normalized });
    });

    addHandler('ReceiveBotPosition', (data: any) =>
      MultiplayerActions.updateBotPosition({ id: data[0], pos: data[1] })
    );

    this.hubConnection.on('PlayerHit', (id: string, health: number) => {
      this.playerHit$.next({ id, health });
    });

    this.hubConnection.on('PlayerDied', (id: string) => {
      this.playerDied$.next({ id });
    });

    this.hubConnection.on('BotDied', (id: string) => {
      this.botDied$.next({ id });
    });

    addHandler('SpawnBullet', (bullet: any) =>
      MultiplayerActions.spawnBullet({ bullet })
    );

    addHandler('RemoveBullet', (id: string) =>
      MultiplayerActions.removeBullet({ id })
    );

    addHandler('UpdateBullet', (bullet: any) =>
      MultiplayerActions.updateBullet({ bullet })
    );

    // Enemy Bullets
    addHandler('SpawnEnemyBullet', (bullet: any) =>
      MultiplayerActions.spawnEnemyBullet({ bullet })
    );

    addHandler('UpdateEnemyBullet', (bullet: any) =>
      MultiplayerActions.updateEnemyBullet({ bullet })
    );

    addHandler('RemoveEnemyBullet', (id: string) =>
      MultiplayerActions.removeEnemyBullet({ id })
    );

    addHandler('UpdateScore', (score: number) =>
      MultiplayerActions.setScore({ score })
    );

    addHandler('GamePaused', (isPaused: boolean) =>
      isPaused ? MultiplayerActions.pauseGame() : MultiplayerActions.resumeGame()
    );

    addHandler('GameOver', () => MultiplayerActions.gameOver());

  }

  public get connectionId(): string | null {
    return this.hubConnection?.connectionId ?? null;
  }

  public stopConnection() {
    this.destroy$.next();
    this.destroy$.complete();
    return this.hubConnection?.stop();
  }

  // Универсальный вызов методов
  async invokeSafe<T>(method: string, ...args: any[]): Promise<T> {
    if (!this.hubConnection) {
      throw new Error("Необходимо в начале создать соединение с сервером");
    }
    await this.waitForConnection();
    return this.invoke<T>(method, ...args);
  }

  private invoke<T>(method: string, ...args: any[]): Promise<T> {
    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Сервер не установил соединение, состояние соединения: ${this.hubConnection.state}`);
    }
    return this.hubConnection.invoke<T>(method, ...args);
  }
}
