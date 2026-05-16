import type { User } from './user';

export type OtpType =
	| { type: 'REGISTRATION'; email: string }
	| { type: 'LOGIN'; email: string }
	| { type: 'PASSWORD_TO_GOOGLE_LINKING'; email: string; password: string }
	| { type: 'GOOGLE_TO_PASSWORD_LINKING'; email: string; credential: string }
	| { type: 'FORGOT_PASSWORD'; email: string; newPassword: string };

export interface AuthenticationResult {
	accessToken: string;
	refreshToken?: string;
	user: User;
	message?: string;
}

export interface OtpResendResult {
	message: string;
	canResendAt?: number;
}

export interface OtpStrategy {
	verify: (otp: string) => Promise<AuthenticationResult>;
	resend: () => Promise<OtpResendResult>;
	getSuccessMessage: () => string;
	getButtonText: () => string;
	handleSuccess: (result: AuthenticationResult) => Promise<void>;
	getErrorMessage: () => string;
}
