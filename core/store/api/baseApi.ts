import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

export const baseApi = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api', // Adjust to your API base URL
		prepareHeaders: (headers, { getState }) => {
			// Add auth token if needed
			const token = (getState() as RootState).auth.token; // if you add token to authSlice
			if (token) {
				headers.set('authorization', `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['User', 'Auth'], // Add tag types for cache invalidation
	endpoints: () => ({}),
});
