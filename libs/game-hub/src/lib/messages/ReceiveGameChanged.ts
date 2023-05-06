import { BaseMessage } from "@knights-rpggame-web/shared";
import { GameInfoNotifyDto } from "../dto/game-info-notify-dto";

export class ReceiveGameChanged extends BaseMessage{
  constructor(public gameInfoNotifyDto: GameInfoNotifyDto) {
    super();
  }
}
