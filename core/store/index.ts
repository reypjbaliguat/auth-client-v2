import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { baseApi } from './api';
import { authReducer } from './features/auth';
import rootMiddleware from './rootMiddleware';

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
const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['auth'], // only auth will be persisted
};
// Create root reducer
const rootReducer = combineReducers({
	auth: persistReducer(persistConfig, authReducer),
	[baseApi.reducerPath]: baseApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) => [
		...getDefaultMiddleware({ serializableCheck: false }).concat(rootMiddleware),
	],
	devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
