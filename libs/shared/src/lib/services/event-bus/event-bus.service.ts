import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { IEventBus } from '../interfaces/i-event-bus';

class Subscription {
  public id: string = uuidv4();
  public eventName: string;
  public listener: (x: any) => void;

  constructor(eventName: string, listener: (x: any) => void) {
    this.eventName = eventName;
    this.listener = listener;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EventBusService implements IEventBus {

  private subscriptions: Array<Subscription> = [];

  public raiseEvent(...events: object[]): void {
    for (const event of events) {
      const eventName = event.constructor.name;

      console.info(`Событие ${eventName} опубликовано`);

      this.subscriptions.filter(x => x.eventName === eventName).forEach(x => {
        x.listener(event);
      });
    }
  }

  public subscribe<T>(eventCtor: new (...args: any[]) => T, listener: (x: T) => void): string {
    const subscription = new Subscription(eventCtor.name, listener)
    this.subscriptions.push(subscription);
    return subscription.id;
  }

  public unsubscribe(subscriptionId: string): void {
    this.subscriptions = this.subscriptions.filter(x => x.id !== subscriptionId);
  }
}
