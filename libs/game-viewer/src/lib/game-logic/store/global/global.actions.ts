import {createAction, props} from '@ngrx/store';

export const resetAll = createAction('[Global] Reset All');
export const signalRError = createAction('[SignalR] Error', props<{ error: string }>());
