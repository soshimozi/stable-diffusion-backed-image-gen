import { combineReducers } from 'redux';
import modelReducer from './slices/models';

import appStateReducer from './slices/appstate';

const reducer = combineReducers({
  model: modelReducer,
  appState: appStateReducer
});


export default reducer;