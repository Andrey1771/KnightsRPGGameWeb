import {inject, Injectable} from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { catchError, concatMap, map, withLatestFrom } from 'rxjs/operators';
import * as MultiplayerActions from './multiplayer.actions';
import { SignalRService } from '../../../services/signal-r-service/signal-r-service';
import { selectScore } from './multiplayer.selectors';
import { MultiplayerState } from './multiplayer.state';

@Injectable()
export class MultiplayerEffects {
  private actions$ = inject(Actions);
  private signalR = inject(SignalRService);
  private store = inject(Store<{ multiplayer: MultiplayerState }>);

  gameOver$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MultiplayerActions.gameOver),
      withLatestFrom(this.store.select(selectScore)),
      concatMap(([_, score]) => {
        const wantsToSave = confirm(`Хотите сохранить результат? Ваш счёт: ${score}`);
        if (!wantsToSave) {
          return of(MultiplayerActions.saveResultFailure({ error: 'User cancelled' }));
        }

        const playerName = prompt("Введите ваше имя:");
        if (!playerName?.trim()) {
          return of(MultiplayerActions.saveResultFailure({ error: 'Empty name' }));
        }

        // Вызов ReportDeath через SignalR
        return from(this.signalR.invokeSafe<void>('ReportDeath', playerName.trim())).pipe(
          map(() => MultiplayerActions.saveResultSuccess()),
          catchError((err) => of(MultiplayerActions.saveResultFailure({ error: err })))
        );
      })
    )
  );
}
