import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, TypedDispatch } from './store';

// Use typed hooks instead of plain `useDispatch` and `useSelector`.
export const useTypedDispatch = () => useDispatch<TypedDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
