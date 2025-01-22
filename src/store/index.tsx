import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { ApiResponse } from '../types';
import { AxiosError } from 'axios';

// Types
export type ThunkApiError = AxiosError<ApiResponse>;

// Custom hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-exports
export { store } from './store';
export type { RootState, AppDispatch } from './store';
export * from './features/auth/authSlice';
export * from './features/auth/authSelector';