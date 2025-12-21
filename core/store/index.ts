import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api';
import authReducer from './authSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		[baseApi.reducerPath]: baseApi.reducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
