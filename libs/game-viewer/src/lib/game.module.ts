import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainWindowComponent } from './main-window/main-window.component';
import { HttpClientModule } from '@angular/common/http';
import { GameComponent } from './game/game.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { lobbyReducer } from './game-logic/store/lobby/lobby.reducer';
import { joinLobbyReducer } from './game-logic/store/join-lobby/join-lobby.reducer';
import { createLobbyReducer } from './game-logic/store/create-lobby/create-lobby.reducer';
import { multiplayerReducer } from './game-logic/store/multiplayer/multiplayer.reducer';
import { CreateLobbyEffects } from './game-logic/store/create-lobby/create-lobby.effects';
import { metaReducers } from './game-logic/store/global/global.metareducer';
import {JoinLobbyEffects} from "./game-logic/store/join-lobby/join-lobby.effects";
import { MultiplayerEffects } from './game-logic/store/multiplayer/multiplayer.effects';

@NgModule({
  imports: [CommonModule, HttpClientModule,
    StoreModule.forFeature('lobby', lobbyReducer, { metaReducers }),
    StoreModule.forFeature('joinLobby', joinLobbyReducer, { metaReducers }),
    StoreModule.forFeature('createLobby', createLobbyReducer, { metaReducers }),
    StoreModule.forFeature('multiplayer', multiplayerReducer, { metaReducers }),

    EffectsModule.forFeature([CreateLobbyEffects, JoinLobbyEffects, MultiplayerEffects])],
  declarations: [MainWindowComponent, GameComponent],
  exports: [MainWindowComponent, GameComponent],
})
export class GameModule {}
