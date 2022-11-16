export interface IEventBus {
  raiseEvent(events: object[]): void;
  subscribe<T>(eventCtor: new (...args: any[]) => T, listener: (x: T) => void): string;
  unsubscribe(subscriptionId: string): void;
}
