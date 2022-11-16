import { IMessagable } from "../interfaces/i-messagable";

export class BaseMessage implements IMessagable{
  public type: string = this.constructor.name;
}
