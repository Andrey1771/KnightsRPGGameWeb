import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameConfigurationService {

  // TODO
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }

  public get gameAPIPath(): string {
    return `https://localhost:7172`
  }
}
