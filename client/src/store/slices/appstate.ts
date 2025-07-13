import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


interface AppState {
  token: string,
  currentPrompt: string | null,
  promptHistory: string[]
}


const initialState: AppState = {
  token: "",
  currentPrompt: null,
  promptHistory: []
};


export const slice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    setToken: (state, { payload }: PayloadAction<string>) => {
      state.token = payload;
    },
    setCurrentPrompt: (state, { payload }: PayloadAction<string | null>) => {
      state.currentPrompt = payload;
    },
    setPromptHistory: (state, { payload }: PayloadAction<string[]>) => {
      state.promptHistory = payload;
    }
  }
});

export const { setCurrentPrompt, setPromptHistory } = slice.actions;


export const actions = {
  ...slice.actions,
  thunk: {
  },
};

export default slice.reducer;