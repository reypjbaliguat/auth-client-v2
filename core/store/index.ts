import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
	FLUSH,
	PAUSE,
	PERSIST,
	persistReducer,
	persistStore,
	PURGE,
	REGISTER,
	REHYDRATE,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { baseApi } from './api';
import { authReducer } from './features/auth';

const createNoopStorage = () => {
	return {
		getItem() {
			return Promise.resolve(null);
		},
		setItem(_key: string, value: unknown) {
			return Promise.resolve(value);
		},
		removeItem() {
			return Promise.resolve();
		},
	};
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

// Persist config for auth slice
const authPersistConfig = {
	key: 'auth',
	storage,
	whitelist: ['user', 'isAuthenticated'], // Only persist specific fields from auth state
	blacklist: ['loading'], // Don't persist loading state as it's temporary UI state
};

// Create root reducer
const rootReducer = combineReducers({
	auth: persistReducer(authPersistConfig, authReducer),
	[baseApi.reducerPath]: baseApi.reducer,
});

export const store = configureStore({
	reducer: rootReducer,
	// Adding the api middleware enables caching, invalidation, polling,
	// and other useful features of RTK-Query.
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
