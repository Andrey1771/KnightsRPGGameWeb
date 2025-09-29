import {inject, Injectable} from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as CreateLobbyActions from './create-lobby.actions';
import * as GlobalActions from '../global/global.actions';
import {exhaustMap, from, of} from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { SignalRService } from '../../../services/signal-r-service/signal-r-service';
import { Store } from '@ngrx/store';
import { CreateLobbyState } from './create-lobby.state';

@Injectable()
export class CreateLobbyEffects {
  private actions$ = inject(Actions);
  private signalR = inject(SignalRService);
  private store = inject(Store<{ createLobby: CreateLobbyState }>);

  createLobby$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CreateLobbyActions.createLobby),
      withLatestFrom(this.store.select(state => state.createLobby)),
      exhaustMap(([_, createLobbyState]) =>
        this.signalR.startConnection().pipe(
          switchMap(() =>
            from(
              this.signalR.invokeSafe(
                "CreateRoom",
                createLobbyState.lobbyName,
                createLobbyState.playerName,
                createLobbyState.maxPlayers
              )
            ).pipe(
              map(() =>
                CreateLobbyActions.createLobbySuccess({
                  lobbyName: createLobbyState.lobbyName,
                  playerName: createLobbyState.playerName,
                  maxPlayers: createLobbyState.maxPlayers
                })
              ),
              catchError((err) =>
                of(
                  CreateLobbyActions.createLobbyFailure({
                    error: err?.message || 'Ошибка при создании комнаты',
                  })
                )
              )
            )
          ),
          catchError((err) =>
            of(
              CreateLobbyActions.createLobbyFailure({
                error: err?.message || 'Ошибка подключения',
              })
            )
          )
        )
      )
    )
  );

  createLobbyError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalActions.signalRError),
      map(({ error }) => CreateLobbyActions.createLobbyFailure({ error }))
    )
  );
}
