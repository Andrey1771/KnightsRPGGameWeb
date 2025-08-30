import { Component, OnInit } from '@angular/core';
import { HttpGameService } from '../services/http-game-service/http-game-service.service';
import {GameInfoDto} from "../dto/game-info-dto";
import { Observable } from 'rxjs';

@Component({
  selector: 'knights-rpggame-web-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss'],
})
export class MainWindowComponent implements OnInit {
  public gameData!: Observable<GameInfoDto>;

  constructor(private _httpGameService: HttpGameService) {}

  ngOnInit(): void {
  }
}
