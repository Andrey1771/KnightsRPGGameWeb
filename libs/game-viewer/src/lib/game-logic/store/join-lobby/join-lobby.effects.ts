import {inject, Injectable} from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as JoinLobbyActions from './join-lobby.actions';
import { SignalRService } from '../../../services/signal-r-service/signal-r-service';
import {switchMap, withLatestFrom} from "rxjs/operators";
import {Store} from "@ngrx/store";
import { JoinLobbyState } from './join-lobby.state';

@Injectable()
export class JoinLobbyEffects {
  private actions$ = inject(Actions);
  private signalR = inject(SignalRService);
  private store = inject(Store<{ joinLobby: JoinLobbyState }>);

  constructor() {}

  joinLobby$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JoinLobbyActions.joinLobby),
      withLatestFrom(this.store.select(state => state.joinLobby)),
      switchMap(([_, joinLobbyState]) => {
        return this.signalR.startConnection().pipe(
          switchMap(() => {
            const roomName = joinLobbyState.lobbyName;
            const playerName = joinLobbyState.playerName;
            return this.signalR.invokeSafe("JoinRoom", roomName, playerName).then(
              () => JoinLobbyActions.joinLobbySuccess(),
              (err: any) => JoinLobbyActions.joinLobbyFailure({error: err.message || 'Ошибка подключения'})
            );
          }))
      })
    )
  );
}
