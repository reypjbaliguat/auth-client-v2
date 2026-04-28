import {
	useLinkGoogleAccountMutation,
	useLinkPasswordMutation,
	useResendOtpMutation,
	useVerifyGoogleLinkMutation,
	useVerifyOtpMutation,
	useVerifyPasswordLinkMutation,
} from '@/core/store/api/authApi';
import {
	resetOtpStep,
	setAuthenticated,
	setGoogleToPasswordLinkingMode,
	setPasswordToGoogleLinkingMode,
} from '@/core/store/features/auth';
import { useAppDispatch } from '@/core/store/hooks';
import { AuthenticationResult, OtpStrategy, OtpType } from '@/core/types/otp';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function useOtpStrategy(otpConfig: OtpType): OtpStrategy {
	const dispatch = useAppDispatch();
	const router = useRouter();

	// API hooks
	const [verifyOtp] = useVerifyOtpMutation();
	const [verifyPasswordLink] = useVerifyPasswordLinkMutation();
	const [verifyGoogleLink] = useVerifyGoogleLinkMutation();
	const [resendOtp] = useResendOtpMutation();
	const [linkPassword] = useLinkPasswordMutation();
	const [linkGoogleAccount] = useLinkGoogleAccountMutation();

	const handleAuthentication = async (result: AuthenticationResult) => {
		// Common authentication logic
		Cookies.set('token', result.accessToken, {
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			httpOnly: false,
			expires: 7,
			path: '/',
		});

		if (result.refreshToken) {
			Cookies.set('refreshToken', result.refreshToken, {
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				httpOnly: false,
				expires: 30,
				path: '/',
			});
		}

		dispatch(setAuthenticated({ user: result.user }));
		dispatch(resetOtpStep());

		console.log('Authentication successful:', result.message);
	};

	switch (otpConfig.type) {
		case 'REGISTRATION':
			return {
				verify: (otp: string) => verifyOtp({ email: otpConfig.email, otp }).unwrap(),
				resend: () => resendOtp({ email: otpConfig.email }).unwrap(),
				getSuccessMessage: () => 'Registration verified successfully!',
				getButtonText: () => 'Verify Registration',
				getErrorMessage: () => 'Failed to verify registration. Please try again.',
				handleSuccess: async (result) => {
					await handleAuthentication(result);
					router.replace('/dashboard');
				},
			};

		case 'LOGIN':
			return {
				verify: (otp: string) => verifyOtp({ email: otpConfig.email, otp }).unwrap(),
				resend: () => resendOtp({ email: otpConfig.email }).unwrap(),
				getSuccessMessage: () => 'Login verified successfully!',
				getButtonText: () => 'Verify Login',
				getErrorMessage: () => 'Failed to verify login. Please try again.',
				handleSuccess: async (result) => {
					await handleAuthentication(result);
					router.replace('/dashboard');
				},
			};

		case 'PASSWORD_TO_GOOGLE_LINKING':
			return {
				verify: (otp: string) =>
					verifyPasswordLink({
						email: otpConfig.email,
						otp,
						password: otpConfig.password,
					}).unwrap(),
				resend: () =>
					linkPassword({
						email: otpConfig.email,
						password: otpConfig.password,
						confirmPassword: otpConfig.password,
					}).unwrap(),
				getSuccessMessage: () => 'Password successfully linked to your Google account!',
				getButtonText: () => 'Link Password',
				getErrorMessage: () => 'Failed to link password. Please try again.',
				handleSuccess: async (result) => {
					dispatch(setPasswordToGoogleLinkingMode(false));
					await handleAuthentication(result);
					router.replace('/dashboard');
				},
			};

		case 'GOOGLE_TO_PASSWORD_LINKING':
			return {
				verify: (otp: string) =>
					verifyGoogleLink({
						email: otpConfig.email,
						otp,
						credential: otpConfig.credential,
					}).unwrap(),
				resend: () =>
					linkGoogleAccount({
						credential: otpConfig.credential,
						email: otpConfig.email,
					}).unwrap(),
				getSuccessMessage: () => 'Google account successfully linked to your password account!',
				getButtonText: () => 'Link Google Account',
				getErrorMessage: () => 'Failed to link Google account. Please try again.',
				handleSuccess: async (result) => {
					dispatch(setGoogleToPasswordLinkingMode(false));
					await handleAuthentication(result);
					router.replace('/dashboard');
				},
			};

		case 'FORGOT_PASSWORD':
			return {
				verify: (otp: string) => verifyOtp({ email: otpConfig.email, otp }).unwrap(), // You'll need a specific endpoint
				resend: () => resendOtp({ email: otpConfig.email }).unwrap(),
				getSuccessMessage: () => 'Password reset verified successfully!',
				getButtonText: () => 'Verify Reset',
				getErrorMessage: () => 'Failed to verify password reset. Please try again.',
				handleSuccess: async (result) => {
					// Handle password reset success - might redirect to new password form
					router.replace('/reset-password');
				},
			};

		default:
			throw new Error(`Unsupported OTP type: ${(otpConfig as any).type}`);
	}
}
