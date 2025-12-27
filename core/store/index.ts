import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api';
import authReducer from './authSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		[baseApi.reducerPath]: baseApi.reducer,
	},
	// Adding the api middleware enables caching, invalidation, polling,
	// and other useful features of RTK-Query.
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
