import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainWindowComponent } from './main-window/main-window.component';
import { HttpClientModule } from '@angular/common/http';
import { GameComponent } from './game/game.component';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [MainWindowComponent, GameComponent],
  exports: [MainWindowComponent, GameComponent],
})
export class GameModule {}
