import { renderWithProviders } from '@/core/utils/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cookies from 'js-cookie';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SignInPage from './page';

// Mock external dependencies
const mockRouter = { push: vi.fn(), replace: vi.fn() };
const mockPathname = vi.fn(() => '/sign-in');
vi.mock('next/navigation', () => ({
	useRouter: () => mockRouter,
	usePathname: () => mockPathname(),
}));
vi.mock('js-cookie');

// Mock API calls
const mockLogin = vi.fn();
const mockGoogleLogin = vi.fn();
const mockVerifyOtp = vi.fn();
vi.mock('@/core/store/api/authApi', () => ({
	useLoginMutation: () => [mockLogin, { isLoading: false, error: null }],
	useGoogleLoginMutation: () => [mockGoogleLogin, { isLoading: false, error: null }],
	useVerifyOtpMutation: () => [mockVerifyOtp, { isLoading: false, error: null }],
}));

// Simple Google Login mock
vi.mock('@react-oauth/google', () => {
	type GoogleLoginProps = {
		onSuccess: (response: { credential: string }) => void;
		onError: () => void;
	};
	return {
		GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		GoogleLogin: ({ onSuccess, onError }: GoogleLoginProps) => (
			<div>
				<button
					data-testid="google-success"
					onClick={() => onSuccess({ credential: 'mock-token' })}
				>
					Google Login
				</button>
				<button data-testid="google-error" onClick={onError}>
					Google Error
				</button>
			</div>
		),
	};
});

describe('SignInPage - User Flows', () => {
	const mockUser = {
		id: '1',
		email: 'test@example.com',
		name: 'Test User',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockLogin.mockReturnValue({ unwrap: vi.fn() });
		mockGoogleLogin.mockReturnValue({ unwrap: vi.fn() });
		mockVerifyOtp.mockReturnValue({ unwrap: vi.fn() });
	});

	const renderSignInPage = (authState = {}) => {
		return renderWithProviders(<SignInPage />, {
			auth: {
				isAuthenticated: false,
				step: 'Login',
				otpEmail: '',
				user: null,
				otpTimer: {
					canResend: true,
					remainingTime: 0,
					canResendAt: null,
				},
				loading: false,
				...authState,
			},
		});
	};

	describe('Authentication Flow', () => {
		it('redirects authenticated users to dashboard', () => {
			renderSignInPage({ isAuthenticated: true });
			expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
		});

		it('shows login form for unauthenticated users', () => {
			renderSignInPage();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
			expect(screen.getByTestId('login-button')).toBeInTheDocument();
		});
	});

	describe('Form Validation', () => {
		it('shows validation errors for invalid input', async () => {
			const user = userEvent.setup();
			renderSignInPage();

			// Try to submit empty form
			await user.click(screen.getByTestId('login-button'));

			// Should show validation errors
			await waitFor(() => {
				expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
			});
		});

		it('prevents submission with invalid email', async () => {
			const user = userEvent.setup();
			renderSignInPage();

			await user.type(screen.getByLabelText(/email/i), 'not-an-email');
			await user.type(screen.getByLabelText(/password/i), 'password');
			await user.click(screen.getByTestId('login-button'));

			await waitFor(() => {
				expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
			});

			// Should not call login API
			expect(mockLogin).not.toHaveBeenCalled();
		});
	});

	describe('Login Flow', () => {
		it('successfully logs in user and triggers OTP flow', async () => {
			const user = userEvent.setup();
			const mockUnwrap = vi.fn().mockResolvedValue({ message: 'OTP sent to your email' });
			mockLogin.mockReturnValue({ unwrap: mockUnwrap });

			renderSignInPage();

			// User enters credentials and submits
			await user.type(screen.getByLabelText(/email/i), 'user@example.com');
			await user.type(screen.getByLabelText(/password/i), 'password123');
			await user.click(screen.getByTestId('login-button'));

			// Should call login API
			await waitFor(() => {
				expect(mockLogin).toHaveBeenCalledWith({
					email: 'user@example.com',
					password: 'password123',
				});
			});
		});

		it('shows error message when login fails', async () => {
			const user = userEvent.setup();
			mockLogin.mockReturnValue({ unwrap: vi.fn().mockRejectedValue(new Error()) });

			renderSignInPage();

			await user.type(screen.getByLabelText(/email/i), 'user@example.com');
			await user.type(screen.getByLabelText(/password/i), 'wrong-password');
			await user.click(screen.getByTestId('login-button'));

			await waitFor(() => {
				expect(screen.getByText(/login failed/i)).toBeInTheDocument();
			});
		});
	});

	describe('Google Login', () => {
		it('successfully logs in with Google and redirects to dashboard', async () => {
			const user = userEvent.setup();
			const mockResponse = {
				accessToken: 'token123',
				refreshToken: 'refresh123',
				user: mockUser,
			};
			mockGoogleLogin.mockReturnValue({ unwrap: vi.fn().mockResolvedValue(mockResponse) });
			const mockCookiesSet = vi.mocked(Cookies.set);

			renderSignInPage();

			await user.click(screen.getByTestId('google-success'));

			await waitFor(() => {
				expect(mockGoogleLogin).toHaveBeenCalledWith({ credential: 'mock-token' });
				expect(mockCookiesSet).toHaveBeenCalledWith('token', 'token123', expect.any(Object));
				expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
			});
		});

		it('shows error when Google login fails', async () => {
			const user = userEvent.setup();
			renderSignInPage();

			await user.click(screen.getByTestId('google-error'));

			await waitFor(() => {
				expect(screen.getByText(/google login failed/i)).toBeInTheDocument();
			});
		});
	});

	describe('OTP Flow', () => {
		it('shows OTP form after successful login', () => {
			renderSignInPage({ step: 'OTP Verification', email: 'user@example.com' });

			expect(screen.getByText(/otp verification/i)).toBeInTheDocument();
			expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
			expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
		});
	});
});
