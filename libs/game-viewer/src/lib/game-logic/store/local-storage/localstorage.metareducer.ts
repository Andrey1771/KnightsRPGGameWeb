import { ActionReducer, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({
    keys: ['playerSettings', 'settings'],
    rehydrate: true, // восстанавливать из localStorage при загрузке
  })(reducer);
}

export const localStorageMetaReducers: MetaReducer[] = [localStorageSyncReducer];
