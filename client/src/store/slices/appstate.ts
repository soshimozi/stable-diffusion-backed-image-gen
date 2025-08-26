import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


interface AppState {
  accessToken: string,
  currentPrompt: string | null,
  promptHistory: string[],
  tokenCount?: number
}


const initialState: AppState = {
  accessToken: "",
  currentPrompt: null,
  promptHistory: [],
};


export const slice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    setTokenCount: (state, { payload }: PayloadAction<number | undefined>) => {
      state.tokenCount = payload;
    },
    setAccessToken: (state, { payload }: PayloadAction<string>) => {
      state.accessToken = payload;
    },
    setCurrentPrompt: (state, { payload }: PayloadAction<string | null>) => {
      state.currentPrompt = payload;
    },
    setPromptHistory: (state, { payload }: PayloadAction<string[]>) => {
      state.promptHistory = payload;
    }
  }
});

export const { setCurrentPrompt, setPromptHistory, setAccessToken, setTokenCount } = slice.actions;


export const actions = {
  ...slice.actions,
  thunk: {
  },
};

export default slice.reducer;