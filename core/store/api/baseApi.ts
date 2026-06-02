import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';
import { setUnauthenticated } from '../features/auth';

type RefreshResponse = {
	accessToken: string;
	refreshToken?: string;
};

let refreshPromise: Promise<RefreshResponse | null> | null = null;

const getAccessTokenCookieOptions = () => ({
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict' as const,
	expires: 7,
	path: '/',
});

const getRefreshTokenCookieOptions = () => ({
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict' as const,
	expires: 30,
	path: '/',
});

const clearAuthCookies = () => {
	Cookies.remove('token', { path: '/' });
	Cookies.remove('refreshToken', { path: '/' });
};

const isRefreshRequest = (args: string | FetchArgs) => {
	if (typeof args === 'string') {
		return args.includes('auth/refresh');
	}

	return typeof args.url === 'string' && args.url.includes('auth/refresh');
};

const baseQuery = fetchBaseQuery({
	baseUrl: process.env.NEXT_PUBLIC_API_URL,
	prepareHeaders: (headers, { arg }) => {
		// Get auth token from secure cookie
		const token = Cookies.get('token');
		if (token) {
			headers.set('authorization', `Bearer ${token}`);
		}

		// Only set content-type for requests with body
		const method = typeof arg === 'object' && arg.method ? arg.method : 'GET';
		if (method !== 'GET' && method !== 'HEAD') {
			headers.set('content-type', 'application/json');
		}

		return headers;
	},
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions
) => {
	let result = await baseQuery(args, api, extraOptions);

	if (result.error && result.error.status === 401 && !isRefreshRequest(args)) {
		// Try to refresh the token
		const refreshToken = Cookies.get('refreshToken');

		if (!refreshToken) {
			clearAuthCookies();
			api.dispatch(setUnauthenticated());
			if (typeof window !== 'undefined') {
				window.location.href = '/sign-in';
			}
			return result;
		}

		if (!refreshPromise) {
			refreshPromise = (async () => {
				const refreshResult = await baseQuery(
					{
						url: 'auth/refresh',
						method: 'POST',
						body: { refreshToken },
					},
					api,
					extraOptions
				);

				if (!refreshResult.data) {
					return null;
				}

				return refreshResult.data as RefreshResponse;
			})();
		}

		const refreshedTokens = await refreshPromise;
		refreshPromise = null;

		if (refreshedTokens?.accessToken) {
			Cookies.set('token', refreshedTokens.accessToken, getAccessTokenCookieOptions());

			if (refreshedTokens.refreshToken) {
				Cookies.set('refreshToken', refreshedTokens.refreshToken, getRefreshTokenCookieOptions());
			}

			// Retry the original request with fresh token
			result = await baseQuery(args, api, extraOptions);
		} else {
			clearAuthCookies();
			api.dispatch(setUnauthenticated());
			if (typeof window !== 'undefined') {
				window.location.href = '/sign-in';
			}
		}
	}

	return result;
};

export const baseApi = createApi({
	reducerPath: 'api',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['User', 'Auth'], // Add tag types for cache invalidation
	endpoints: () => ({}),
});
