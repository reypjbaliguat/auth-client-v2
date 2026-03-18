import type { User } from '../../types';
import { baseApi } from './baseApi';

interface LinkPasswordRequest {
	email: string;
	password: string;
	confirmPassword: string;
}

interface LinkPasswordResponse {
	message: string; // "OTP sent to link password to your Google account"
}

interface VerifyPasswordLinkRequest {
	email: string;
	otp: string;
	password: string;
}

interface VerifyPasswordLinkResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
	message: string; // "Password successfully linked to your Google account"
}

interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	message: string;
	error?: string;
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

interface ResendOtpRequest {
	email: string;
}

interface ResendOtpResponse {
	message: string;
	canResendAt: number; // Unix timestamp when user can resend again
}

interface OtpStatusResponse {
	canResend: boolean;
	remainingTime?: number; // Seconds until can resend
	canResendAt?: number; // Unix timestamp when user can resend again
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
		// Resend OTP with rate limiting
		resendOtp: builder.mutation<ResendOtpResponse, ResendOtpRequest>({
			query: ({ email }) => ({
				url: 'auth/resend-otp',
				method: 'POST',
				body: { email },
			}),
			invalidatesTags: ['Auth'],
		}),
		// Get OTP status and remaining time
		getOtpStatus: builder.query<OtpStatusResponse, { email: string }>({
			query: ({ email }) => ({
				url: `auth/otp-status/${encodeURIComponent(email)}`,
				method: 'GET',
			}),
			providesTags: ['Auth'],
		}),
		forgotPassword: builder.mutation<{ message: string }, { email: string }>({
			query: ({ email }) => ({
				url: 'auth/forgot-password',
				method: 'POST',
				body: { email },
			}),
			invalidatesTags: ['Auth'],
		}),
		resetPassword: builder.mutation<
			{ message: string },
			{ email: string; otp: string; password: string }
		>({
			query: ({ email, otp, password }) => ({
				url: 'auth/reset-password',
				method: 'POST',
				body: { email, otp, password },
			}),
			invalidatesTags: ['Auth'],
		}),
		linkPassword: builder.mutation<LinkPasswordResponse, LinkPasswordRequest>({
			query: (data) => ({
				url: 'auth/link-password',
				method: 'POST',
				body: data,
			}),
			invalidatesTags: ['Auth'],
		}),

		verifyPasswordLink: builder.mutation<VerifyPasswordLinkResponse, VerifyPasswordLinkRequest>({
			query: ({ email, otp, password }) => ({
				url: 'auth/verify-password-link',
				method: 'POST',
				body: { email, otp, password },
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
	useResendOtpMutation,
	useGetOtpStatusQuery,
	useForgotPasswordMutation,
	useResetPasswordMutation,
	useLinkPasswordMutation,
	useVerifyPasswordLinkMutation,
} = authApi;
