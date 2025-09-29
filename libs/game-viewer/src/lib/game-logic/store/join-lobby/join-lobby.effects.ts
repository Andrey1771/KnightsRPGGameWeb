import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as JoinLobbyActions from './join-lobby.actions';
import * as GlobalActions from '../global/global.actions';
import { SignalRService } from '../../../services/signal-r-service/signal-r-service';
import { Store } from '@ngrx/store';
import { JoinLobbyState } from './join-lobby.state';
import { exhaustMap, switchMap, withLatestFrom, map, catchError, from } from 'rxjs';

@Injectable()
export class JoinLobbyEffects {
  private actions$ = inject(Actions);
  private signalR = inject(SignalRService);
  private store = inject(Store<{ joinLobby: JoinLobbyState }>);

  joinLobby$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JoinLobbyActions.joinLobby),
      withLatestFrom(this.store.select(state => state.joinLobby)),
      exhaustMap(([_, joinLobbyState]) =>
        this.signalR.startConnection().pipe(
          switchMap(() =>
            from(
              this.signalR.invokeSafe(
                'JoinRoom',
                joinLobbyState.lobbyName,
                joinLobbyState.playerName
              )
            ).pipe(
              map(() => JoinLobbyActions.joinLobbySuccess()),
              catchError((err: any) =>
                [JoinLobbyActions.joinLobbyFailure({
                  error: err?.message || 'Ошибка подключения'
                })]
              )
            )
          ),
          catchError((err: any) =>
            [JoinLobbyActions.joinLobbyFailure({
              error: err?.message || 'Ошибка подключения к SignalR'
            })]
          )
        )
      )
    )
  );

  joinLobbyError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalActions.signalRError),
      map(({ error }) => JoinLobbyActions.joinLobbyFailure({ error }))
    )
  );
}
