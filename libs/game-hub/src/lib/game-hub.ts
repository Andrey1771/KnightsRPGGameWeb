import {HubConnectionBuilder} from "@microsoft/signalr";
import {EventBusService} from "@knights-rpggame-web/shared";
import {GameInfoNotifyDto} from "./dto/game-info-notify-dto";
import {Injectable} from "@angular/core";
import {ReceiveGameChanged} from "./messages/receive-game-changed";

@Injectable({
  providedIn: 'root',
})
export class GameHub {

  constructor(private _eventBus: EventBusService) {
  }
}
