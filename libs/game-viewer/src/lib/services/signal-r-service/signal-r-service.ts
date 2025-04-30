import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  public startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7172/gamehub") // TODO заменить на реальный URL
      .withAutomaticReconnect()
      .build();

    return this.hubConnection.start();
  }

  public get connection(): signalR.HubConnection {
    return this.hubConnection;
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}
