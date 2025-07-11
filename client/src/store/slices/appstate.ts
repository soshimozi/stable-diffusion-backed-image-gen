import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


interface AppState {
  generating: boolean,
  lastResult: string | null,
  currentPrompt: string | null,
  promptHistory: string[]
}


const initialState: AppState = {
  generating: false,
  lastResult: null,
  currentPrompt: null,
  promptHistory: []
};


export const slice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    setGenerating: (state, { payload }: PayloadAction<boolean>) => {
      state.generating = payload;
    },
    setLastResult: (state, { payload }: PayloadAction<string | null>) => {
      state.lastResult = payload;
    },
    setCurrentPrompt: (state, { payload }: PayloadAction<string | null>) => {
      state.currentPrompt = payload;
    },
    setPromptHistory: (state, { payload }: PayloadAction<string[]>) => {
      state.promptHistory = payload;
    }
  }
});

export const { setGenerating, setLastResult, setCurrentPrompt, setPromptHistory } = slice.actions;


export const actions = {
  ...slice.actions,
  thunk: {
  },
};

export default slice.reducer;