import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GameModule } from '@knights-rpggame-web/game-viewer';

import { provideNgxWebstorage, withLocalStorage, withNgxWebstorageConfig, withSessionStorage } from 'ngx-webstorage';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, GameModule],
  providers: [provideNgxWebstorage(
    withNgxWebstorageConfig({ separator: ':', caseSensitive: true }),
    withLocalStorage(),
    withSessionStorage()
  )],
  bootstrap: [AppComponent],
})
export class AppModule {}
