import { configureStore } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import Cookies from 'js-cookie';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setAuthenticated } from '@/core/store/features/auth';
import authReducer from '@/core/store/features/auth/authSlice';

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/v1/api';

import { baseApi } from './baseApi';

vi.mock('js-cookie', () => ({
	default: {
		get: vi.fn(),
		set: vi.fn(),
		remove: vi.fn(),
	},
}));

const testApi = baseApi.injectEndpoints({
	overrideExisting: true,
	endpoints: (builder) => ({
		getProtected: builder.query<{ ok: boolean }, string>({
			query: (resource) => ({ url: resource, method: 'GET' }),
		}),
		postRefreshDirect: builder.mutation<{ ok: boolean }, { refreshToken: string }>({
			query: (body) => ({
				url: 'auth/refresh',
				method: 'POST',
				body,
			}),
		}),
	}),
});

const makeStore = () =>
	configureStore({
		reducer: {
			[baseApi.reducerPath]: baseApi.reducer,
			auth: authReducer,
		},
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
	});

const jsonResponse = (status: number, body: unknown) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
		},
	});

const getRequestUrl = (input: RequestInfo | URL): string => {
	if (typeof input === 'string') {
		return input;
	}

	if (input instanceof URL) {
		return input.toString();
	}

	if (input instanceof Request) {
		return input.url;
	}

	return String(input);
};

describe('baseApi reauth flow', () => {
	const OriginalRequest = globalThis.Request;

	const mockUser = {
		_id: 'user-1',
		email: 'test@example.com',
		isActive: true,
		emailVerified: true,
		createdAt: new Date().toISOString(),
	};

	beforeEach(() => {
		process.env.NEXT_PUBLIC_API_URL = 'http://localhost/';
		vi.restoreAllMocks();
		vi.clearAllMocks();

		class RequestWithBase extends OriginalRequest {
			constructor(input: RequestInfo | URL, init?: RequestInit) {
				const normalizedInput =
					typeof input === 'string' && !/^(https?:)?\/\//i.test(input)
						? new URL(input, 'http://localhost/').toString()
						: input;
				super(normalizedInput, init);
			}
		}

		vi.stubGlobal('Request', RequestWithBase);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('retries original request after successful refresh', async () => {
		const mockedFetch = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
			.mockResolvedValueOnce(
				jsonResponse(200, {
					accessToken: 'new-access-token',
					refreshToken: 'new-refresh-token',
				})
			)
			.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
		vi.stubGlobal('fetch', mockedFetch);

		vi.mocked(Cookies.get).mockImplementation((key: string) => {
			if (key === 'token') {
				return 'expired-access-token';
			}
			if (key === 'refreshToken') {
				return 'valid-refresh-token';
			}
			return undefined;
		});

		const store = makeStore();
		store.dispatch(setAuthenticated({ user: mockUser }));

		const result = await store.dispatch(testApi.endpoints.getProtected.initiate('protected/me'));

		expect(result.data).toEqual({ ok: true });
		expect(Cookies.set).toHaveBeenCalledWith(
			'token',
			'new-access-token',
			expect.objectContaining({ path: '/' })
		);
		expect(Cookies.set).toHaveBeenCalledWith(
			'refreshToken',
			'new-refresh-token',
			expect.objectContaining({ path: '/' })
		);
		expect(store.getState().auth.isAuthenticated).toBe(true);
		expect(mockedFetch).toHaveBeenCalledTimes(3);
	});

	it('sets unauthenticated and clears cookies when refresh token is missing', async () => {
		const mockedFetch = vi.fn().mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }));
		vi.stubGlobal('fetch', mockedFetch);

		vi.mocked(Cookies.get).mockImplementation((key: string) => {
			if (key === 'token') {
				return 'expired-access-token';
			}
			if (key === 'refreshToken') {
				return undefined;
			}
			return undefined;
		});

		const store = makeStore();
		store.dispatch(setAuthenticated({ user: mockUser }));

		const result = await store.dispatch(testApi.endpoints.getProtected.initiate('protected/me'));

		expect((result.error as FetchBaseQueryError)?.status).toBe(401);
		expect(Cookies.remove).toHaveBeenCalledWith('token', { path: '/' });
		expect(Cookies.remove).toHaveBeenCalledWith('refreshToken', { path: '/' });
		expect(store.getState().auth.isAuthenticated).toBe(false);
		expect(mockedFetch).toHaveBeenCalledTimes(1);
	});

	it('sets unauthenticated and clears cookies when refresh request fails', async () => {
		const mockedFetch = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
			.mockResolvedValueOnce(jsonResponse(401, { message: 'refresh invalid' }));
		vi.stubGlobal('fetch', mockedFetch);

		vi.mocked(Cookies.get).mockImplementation((key: string) => {
			if (key === 'token') {
				return 'expired-access-token';
			}
			if (key === 'refreshToken') {
				return 'expired-refresh-token';
			}
			return undefined;
		});

		const store = makeStore();
		store.dispatch(setAuthenticated({ user: mockUser }));

		const result = await store.dispatch(testApi.endpoints.getProtected.initiate('protected/me'));

		expect((result.error as FetchBaseQueryError)?.status).toBe(401);
		expect(Cookies.remove).toHaveBeenCalledWith('token', { path: '/' });
		expect(Cookies.remove).toHaveBeenCalledWith('refreshToken', { path: '/' });
		expect(store.getState().auth.isAuthenticated).toBe(false);
		expect(mockedFetch).toHaveBeenCalledTimes(2);
	});

	it('uses single-flight refresh for concurrent 401 responses', async () => {
		const mockedFetch = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(401, { message: 'expired-a' }))
			.mockResolvedValueOnce(jsonResponse(401, { message: 'expired-b' }))
			.mockResolvedValueOnce(
				jsonResponse(200, {
					accessToken: 'new-access-token',
				})
			)
			.mockResolvedValueOnce(jsonResponse(200, { ok: true }))
			.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
		vi.stubGlobal('fetch', mockedFetch);

		vi.mocked(Cookies.get).mockImplementation((key: string) => {
			if (key === 'token') {
				return 'expired-access-token';
			}
			if (key === 'refreshToken') {
				return 'shared-refresh-token';
			}
			return undefined;
		});

		const store = makeStore();
		store.dispatch(setAuthenticated({ user: mockUser }));

		const [resultA, resultB] = await Promise.all([
			store.dispatch(testApi.endpoints.getProtected.initiate('protected/a')),
			store.dispatch(testApi.endpoints.getProtected.initiate('protected/b')),
		]);

		expect(resultA.data).toEqual({ ok: true });
		expect(resultB.data).toEqual({ ok: true });

		const refreshCalls = mockedFetch.mock.calls.filter(([input]) =>
			getRequestUrl(input as RequestInfo | URL).includes('auth/refresh')
		);
		expect(refreshCalls).toHaveLength(1);
		expect(mockedFetch).toHaveBeenCalledTimes(5);
	});

	it('does not attempt recursive refresh when auth/refresh itself returns 401', async () => {
		const mockedFetch = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(401, { message: 'invalid refresh' }));
		vi.stubGlobal('fetch', mockedFetch);

		vi.mocked(Cookies.get).mockImplementation((key: string) => {
			if (key === 'token') {
				return 'expired-access-token';
			}
			if (key === 'refreshToken') {
				return 'expired-refresh-token';
			}
			return undefined;
		});

		const store = makeStore();
		const result = await store.dispatch(
			testApi.endpoints.postRefreshDirect.initiate({ refreshToken: 'expired-refresh-token' })
		);

		expect((result.error as FetchBaseQueryError)?.status).toBe(401);
		expect(mockedFetch).toHaveBeenCalledTimes(1);
	});
});
