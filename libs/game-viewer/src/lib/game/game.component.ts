import { Component, OnInit } from '@angular/core';
import { GameManagerService } from '../game-logic/game-manager/game-manager.service';

@Component({
  selector: 'knights-rpggame-web-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  constructor(private _gameManagerService: GameManagerService) {}

  ngOnInit() {
    this._gameManagerService.createGame();
  }
}
