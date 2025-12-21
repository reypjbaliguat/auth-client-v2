import type { User } from '../authSlice';
import { baseApi } from './baseApi';

interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	user: User;
	token: string;
}

export const authApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation<LoginResponse, LoginRequest>({
			query: (credentials) => ({
				url: 'auth/login',
				method: 'POST',
				body: credentials,
			}),
			invalidatesTags: ['Auth'],
		}),
		logout: builder.mutation<void, void>({
			query: () => ({
				url: 'auth/logout',
				method: 'POST',
			}),
			invalidatesTags: ['Auth'],
		}),
		getCurrentUser: builder.query<User, void>({
			query: () => 'auth/me',
			providesTags: ['User'],
		}),
	}),
});

export const { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } = authApi;
