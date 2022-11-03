import { Component, OnInit } from '@angular/core';
import { HttpGameService } from "../services/http-game-service/http-game-service.service";

@Component({
  selector: 'knights-rpggame-web-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss'],
})
export class MainWindowComponent implements OnInit {
  constructor(private _httpGameService: HttpGameService) {}

  ngOnInit(): void {
    this._httpGameService.getGameData().subscribe(gameData => console.log(gameData));
  }
}
