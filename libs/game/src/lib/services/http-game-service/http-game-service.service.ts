import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {
  GameConfigurationService
} from "@knights-rpggame-web/shared";

@Injectable({
  providedIn: 'root'
})
export class HttpGameService {

  constructor(private _http: HttpClient,
              private _gameConfigurationService: GameConfigurationService){ }

  getGameData(){
    return this._http.get(`${this._gameConfigurationService.gameAPIPath}/api/game`);
  }
}
