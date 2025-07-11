import { actions as modelsActions } from './slices/models';
import { actions as appStateActions } from './slices/appstate';

export const actions = {
  models:     modelsActions,
  appState: appStateActions
};
