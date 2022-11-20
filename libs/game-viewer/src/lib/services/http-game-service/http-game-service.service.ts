import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameConfigurationService } from '@knights-rpggame-web/shared';
import { GetGameDataMessage } from '../../../../../shared/src/lib/messages/get-game-data-message';
import { EventBusService } from '../../../../../shared/src/lib/services/event-bus/event-bus.service';

@Injectable({
  providedIn: 'root',
})
export class HttpGameService {
  constructor(
    private _http: HttpClient,
    private _gameConfigurationService: GameConfigurationService,
    private _eventBus: EventBusService
  ) {}

  getGameData() {
    this._eventBus.subscribe(GetGameDataMessage, () => {
      console.log('Работает)');
    });
    this._eventBus.raiseEvent([new GetGameDataMessage()]);
    return this._http.get(
      `${this._gameConfigurationService.gameAPIPath}/api/game`
    );
  }
}
