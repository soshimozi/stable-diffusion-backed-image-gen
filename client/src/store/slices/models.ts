import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AIModel } from '../../types/AIModel';


interface ModelsState {
  modelList: AIModel[];
  selectedModel: AIModel | undefined;
}


const initialState: ModelsState = {
  modelList: [],
  selectedModel: undefined
};


export const slice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    setModels: (state, { payload }: PayloadAction<AIModel[]>) => {
      state.modelList = payload;
    },
    setModel: (state, { payload }: PayloadAction<AIModel | undefined>) => {
      state.selectedModel = payload;
    },
  }
});

export const { setModels, setModel } = slice.actions;


export const actions = {
  ...slice.actions,
  thunk: {
  },
};

export default slice.reducer;