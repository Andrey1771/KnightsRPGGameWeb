import { ActionReducer, MetaReducer } from '@ngrx/store';
import { resetAll } from './global.actions';

export function resetAllMetaReducer<State>(
  reducer: ActionReducer<State>
): ActionReducer<State> {
  return (state, action) => {
    if (action.type === resetAll.type) {
      state = undefined; // сброс всего стора
    }
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer[] = [resetAllMetaReducer];
