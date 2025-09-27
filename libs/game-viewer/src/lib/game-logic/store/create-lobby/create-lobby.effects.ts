import {inject, Injectable} from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as CreateLobbyActions from './create-lobby.actions';
import {from, of } from 'rxjs';
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
      switchMap(([_, createLobbyState]) =>
        this.signalR.startConnection().pipe(
          switchMap(() => {
            console.log("lobbyName 2: ", createLobbyState.lobbyName);
            return from(
              this.signalR.invokeSafe(
                "CreateRoom",
                createLobbyState.lobbyName,
                createLobbyState.playerName,
                createLobbyState.maxPlayers
              )
            ).pipe(
              map(() => ({ type: '[CreateLobby] Create Room Invoked' })),
              catchError((err) =>
                of(
                  CreateLobbyActions.createLobbyFailure({
                    error: err.message || 'Ошибка при создании комнаты',
                  })
                )
              )
            )
          }

          ),
          catchError((err) =>
            of(
              CreateLobbyActions.createLobbyFailure({
                error: err.message || 'Ошибка подключения',
              })
            )
          )
        )
      )
    )
  );

}
