export type OtpType =
	| { type: 'REGISTRATION'; email: string }
	| { type: 'LOGIN'; email: string }
	| { type: 'PASSWORD_TO_GOOGLE_LINKING'; email: string; password: string }
	| { type: 'GOOGLE_TO_PASSWORD_LINKING'; email: string; credential: string }
	| { type: 'FORGOT_PASSWORD'; email: string; newPassword: string };

export interface OtpStrategy {
	verify: (otp: string) => Promise<any>;
	resend: () => Promise<any>;
	getSuccessMessage: () => string;
	getButtonText: () => string;
	handleSuccess: (result: any) => Promise<void>;
	getErrorMessage: () => string;
}

export interface AuthenticationResult {
	accessToken: string;
	refreshToken?: string;
	user: any;
	message?: string;
}
