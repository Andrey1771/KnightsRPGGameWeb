import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GameModule } from '@knights-rpggame-web/game-viewer';

import { provideNgxWebstorage, withLocalStorage, withNgxWebstorageConfig, withSessionStorage } from 'ngx-webstorage';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  playerSettingsReducer
} from "../../../../libs/game-viewer/src/lib/game-logic/store/player-settings/player-settings.reducer";
import {
  localStorageMetaReducers
} from "../../../../libs/game-viewer/src/lib/game-logic/store/local-storage/localstorage.metareducer";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,
    StoreModule.forRoot(
      { playerSettings: playerSettingsReducer },
      { metaReducers: localStorageMetaReducers }
    ),
    EffectsModule.forRoot([]),
    GameModule],
  providers: [provideNgxWebstorage(
    withNgxWebstorageConfig({ separator: ':', caseSensitive: true }),
    withLocalStorage(),
    withSessionStorage()
  )],
  bootstrap: [AppComponent],
})
export class AppModule {}
