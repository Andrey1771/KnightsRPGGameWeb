import { Component, OnInit } from '@angular/core';
import { GameScene } from "../scene/game-scene";

@Component({
  selector: 'knights-rpggame-web-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  constructor() {
    this.config = {
      type: Phaser.WEBGL,
      height: "100%",
      width: "100%",
      scene: [ GameScene ],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 100 }
        }
      }
    };
  }
  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
    this.phaserGame.scale.autoCenter = Phaser.Scale.Center.CENTER_BOTH;
    //this.phaserGame.scale. = Phaser.Scale.Center.CENTER_BOTH;
    /*this.phaserGame.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.phaserGame.scale.pageAlignHorisontally = true;
    this.phaserGame.scale.pageAlignVertically = true;*/
  }
}
