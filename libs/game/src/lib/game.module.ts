import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainWindowComponent } from './main-window/main-window.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MainWindowComponent],
  exports: [MainWindowComponent],
})
export class GameModule {}
