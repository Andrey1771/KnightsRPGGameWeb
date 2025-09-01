import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  public startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7172/gamehub", {
        transport: signalR.HttpTransportType.WebSockets
      }) // TODO заменить на реальный URL
      .withAutomaticReconnect()
      .build();

    return this.hubConnection.start();
  }

  public stopConnection(): Promise<void> {
    return this.hubConnection.stop();
  }

  public get connection(): signalR.HubConnection { //TODO Убрать
    return this.hubConnection;
  }

  public get connectionId(): string | null { //TODO Убрать
    return this.hubConnection.connectionId;
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}
