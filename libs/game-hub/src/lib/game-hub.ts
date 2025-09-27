import {EventBusService} from "@knights-rpggame-web/shared";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class GameHub {

  constructor(private _eventBus: EventBusService) {
  }
}
