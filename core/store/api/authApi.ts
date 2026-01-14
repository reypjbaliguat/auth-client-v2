import type { User } from '../../types';
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

interface GoogleLoginRequest {
	credential: string;
}

interface GoogleLoginResponse {
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
		register: builder.mutation<LoginResponse, LoginRequest>({
			query: (credentials) => ({
				url: `auth/register`,
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
		googleLogin: builder.mutation<GoogleLoginResponse, GoogleLoginRequest>({
			query: (credentials) => ({
				url: `auth/google-login`,
				method: 'POST',
				body: credentials,
			}),
			invalidatesTags: ['Auth'],
		}),
		refreshToken: builder.mutation<
			{ accessToken: string; refreshToken?: string },
			{ refreshToken: string }
		>({
			query: ({ refreshToken }) => ({
				url: 'auth/refresh',
				method: 'POST',
				body: { refreshToken },
			}),
			invalidatesTags: ['Auth'],
		}),
	}),
});

export const {
	useLoginMutation,
	useLogoutMutation,
	useVerifyOtpMutation,
	useGetCurrentUserQuery,
	useGoogleLoginMutation,
	useRefreshTokenMutation,
	useRegisterMutation,
} = authApi;
