import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './createStore';

// Typed versions of the Redux hooks, so components get autocomplete + safety.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
