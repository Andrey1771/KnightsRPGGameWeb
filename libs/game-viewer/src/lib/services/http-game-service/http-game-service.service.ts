import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventBusService, GameConfigurationService, GetGameDataMessage } from '@knights-rpggame-web/shared';
import {GameHub} from "@knights-rpggame-web/game-hub";
import {GameInfoDto} from "../../dto/game-info-dto";

@Injectable({
  providedIn: 'root',
})
export class HttpGameService {
  constructor(
    private _http: HttpClient,
    private _gameConfigurationService: GameConfigurationService,
    private _eventBus: EventBusService,
    private _gameHub: GameHub
  ) {}

  getGameData() {
    this._eventBus.subscribe(GetGameDataMessage, () => {
      console.log('Работает)');
    });
    this._eventBus.raiseEvent([new GetGameDataMessage()]);
    this._gameHub.initializeSignalRConnection();
    return this._http.get<GameInfoDto>(
      `${this._gameConfigurationService.gameAPIPath}/api/game`
    );
  }
}
