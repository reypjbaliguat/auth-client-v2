import type { User } from '../authSlice';
import { baseApi } from './baseApi';

interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	message: string;
}

interface VerifyOTPResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}

export const authApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation<LoginResponse, LoginRequest>({
			query: (credentials) => ({
				url: `auth/login`,
				method: 'POST',
				body: credentials,
			}),
			invalidatesTags: ['Auth'],
		}),
		// verify Otp
		verifyOtp: builder.mutation<VerifyOTPResponse, { email: string; otp: string }>({
			query: ({ email, otp }) => ({
				url: `auth/verify-otp`,
				method: 'POST',
				body: { email, otp },
			}),
			invalidatesTags: ['Auth'],
		}),
		logout: builder.mutation<void, void>({
			query: () => ({
				url: `auth/logout`,
				method: 'POST',
			}),
			invalidatesTags: ['Auth'],
		}),
		getCurrentUser: builder.query<User, void>({
			query: () => `auth/me`,
			providesTags: ['User'],
		}),
	}),
});

export const { useLoginMutation, useLogoutMutation, useVerifyOtpMutation, useGetCurrentUserQuery } =
	authApi;
