import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

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

	if (result.error && result.error.status === 401) {
		// Try to refresh the token
		const refreshToken = Cookies.get('refreshToken');
		if (refreshToken) {
			const refreshResult = await baseQuery(
				{
					url: 'auth/refresh',
					method: 'POST',
					body: { refreshToken },
				},
				api,
				extraOptions
			);

			if (refreshResult.data) {
				const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as {
					accessToken: string;
					refreshToken?: string;
				};

				// Update cookies
				Cookies.set('token', accessToken, {
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					httpOnly: false,
					expires: 7,
					path: '/',
				});
				if (newRefreshToken) {
					Cookies.set('refreshToken', newRefreshToken, {
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'strict',
						httpOnly: false,
						expires: 30,
						path: '/',
					});
				}

				// Retry the original request
				result = await baseQuery(args, api, extraOptions);
			} else {
				// Refresh failed, redirect to login
				Cookies.remove('token');
				Cookies.remove('refreshToken');
				if (typeof window !== 'undefined') {
					window.location.href = '/sign-in';
				}
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
