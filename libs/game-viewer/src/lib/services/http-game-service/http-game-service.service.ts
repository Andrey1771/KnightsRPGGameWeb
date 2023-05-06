import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventBusService, GameConfigurationService, GetGameDataMessage } from '@knights-rpggame-web/shared';

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
