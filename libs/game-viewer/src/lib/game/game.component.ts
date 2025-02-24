import {Component, Input, OnInit} from '@angular/core';
import { GameManagerService } from '../game-logic/game-manager/game-manager.service';
import {GameInfoDto} from "../dto/game-info-dto";

@Component({
  selector: 'knights-rpggame-web-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  @Input()
  public gameData!: GameInfoDto;

  constructor(private _gameManagerService: GameManagerService) {}

  ngOnInit() {
    this._gameManagerService.createGame();
  }
}
