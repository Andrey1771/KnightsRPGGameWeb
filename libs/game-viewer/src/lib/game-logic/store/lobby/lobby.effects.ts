import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as GlobalActions from '../global/global.actions';
import * as LobbyActions from '../lobby/lobby.actions';
import { map } from 'rxjs';

@Injectable()
export class LobbyEffects {
  private actions$ = inject(Actions);

  lobbyError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalActions.signalRError),
      map(({ error }) => LobbyActions.lobbyFailure({ error }))
    )
  );
}
