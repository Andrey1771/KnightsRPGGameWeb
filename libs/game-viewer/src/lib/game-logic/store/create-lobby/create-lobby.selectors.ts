import { createFeatureSelector } from "@ngrx/store";
import { CreateLobbyState } from "./create-lobby.state";

export const selectCreateLobbyState =
  createFeatureSelector<CreateLobbyState>('createLobby');
