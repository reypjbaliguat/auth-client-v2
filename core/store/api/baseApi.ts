import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const baseApi = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_URL, // Adjust to your API base URL
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
		// Remove credentials: 'include' to avoid CORS issues
		// Add it back only if your backend explicitly supports it
	}),
	tagTypes: ['User', 'Auth'], // Add tag types for cache invalidation
	endpoints: () => ({}),
});
