import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventBusService, GameConfigurationService, GetGameDataMessage } from '@knights-rpggame-web/shared';
import {GameHub} from "@knights-rpggame-web/game-hub";
import {GameInfoDto} from "../../dto/game-info-dto";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {GameInfoNotifyDto} from "../../../../../game-hub/src/lib/dto/game-info-notify-dto";
import {ReceiveGameChanged} from "../../../../../game-hub/src/lib/messages/receive-game-changed";

@Injectable({
  providedIn: 'root',
})
export class HttpGameService {
  private _connection: HubConnection;

  constructor(
    private _http: HttpClient,
    private _gameConfigurationService: GameConfigurationService,
    private _eventBus: EventBusService,
    private _gameHub: GameHub,
  ) {
    this._connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7172/gamehub") //TODO
      .build();
  }

  getGameData() {
    this._eventBus.subscribe(GetGameDataMessage, () => {
      console.log('Работает)');
    });
    this._eventBus.raiseEvent([new GetGameDataMessage()]);


    this._connection.start().then(function () {
      throw new Error("Not Implemented");
    }).catch(function (err) {
      return console.error(err.toString());
    });

    this._connection.on("ReceiveGameChanged", (resp: GameInfoNotifyDto) => this._eventBus.raiseEvent(new ReceiveGameChanged(resp)));
    //this._gameHub.initializeSignalRConnection();
    return this._http.get<GameInfoDto>(
      `${this._gameConfigurationService.gameAPIPath}/api/game`
    );
  }

  createRoom(roomName: string, maxPlayers: number) {
    // Обработчик для успешного создания комнаты
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this._connection.on("RoomCreated", function(roomName) {
    });

    if (roomName.trim() === "") {
      alert("Room name cannot be empty!");
      return;
    }

    // Вызов метода CreateRoom в SignalR
    this._connection.invoke("CreateRoom", roomName, maxPlayers)
      .catch(function(err) {
        return console.error(err.toString());
      });
  }

}
