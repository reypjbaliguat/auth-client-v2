import { renderWithProviders } from '@/core/utils/renderWithProviders';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OtpForm from './OtpForm';

// Mock external dependencies
const mockRouter = { push: vi.fn(), replace: vi.fn() };
const mockPathname = vi.fn(() => '/sign-in');
vi.mock('next/navigation', () => ({
	useRouter: () => mockRouter,
	usePathname: () => mockPathname(),
}));

// Mock API endpoints
const mockVerifyOtp = vi.fn();
const mockResendOtp = vi.fn();
const mockGetOtpStatus = vi.fn();
const mockVerifyPasswordLink = vi.fn();
const mockVerifyGoogleLink = vi.fn();
const mockLinkPassword = vi.fn();
const mockLinkGoogleAccount = vi.fn();
vi.mock('@/core/store/api/authApi', () => ({
	useVerifyOtpMutation: () => [mockVerifyOtp, { isLoading: false }],
	useResendOtpMutation: () => [mockResendOtp, { isLoading: false }],
	useGetOtpStatusQuery: () => mockGetOtpStatus(),
	useVerifyPasswordLinkMutation: () => [mockVerifyPasswordLink, { isLoading: false }],
	useVerifyGoogleLinkMutation: () => [mockVerifyGoogleLink, { isLoading: false }],
	useLinkPasswordMutation: () => [mockLinkPassword, { isLoading: false }],
	useLinkGoogleAccountMutation: () => [mockLinkGoogleAccount, { isLoading: false }],
}));

// Mock environment variable for baseURL
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api';

describe('OtpForm', () => {
	const mockOnSubmit = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockVerifyOtp.mockReturnValue({ unwrap: vi.fn() });
		mockResendOtp.mockReturnValue({ unwrap: vi.fn() });
		mockVerifyPasswordLink.mockReturnValue({ unwrap: vi.fn() });
		mockVerifyGoogleLink.mockReturnValue({ unwrap: vi.fn() });
		mockLinkPassword.mockReturnValue({ unwrap: vi.fn() });
		mockLinkGoogleAccount.mockReturnValue({ unwrap: vi.fn() });
		// Default API response - can be overridden in individual tests
		mockGetOtpStatus.mockReturnValue({
			data: { canResend: true, remainingTime: 0, canResendAt: null },
		});
	});
	afterEach(() => {
		vi.resetAllMocks();
	});

	const loginOtpConfig = { type: 'LOGIN' as const, email: 'test@example.com' };

	const renderOtpForm = (authState = {}) => {
		return renderWithProviders(<OtpForm otpConfig={loginOtpConfig} />, {
			auth: {
				isAuthenticated: false,
				step: 'Login',
				otpEmail: '',
				user: null,
				loading: false,
				otpTimer: {
					canResend: true,
					remainingTime: 0,
					canResendAt: null,
				},
				...authState,
			},
		});
	};

	it('renders OtpForm component', () => {
		act(() => {
			renderOtpForm();
		});
		expect(screen.getByRole('button', { name: 'Verify Login' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Back to Login' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Resend OTP' })).toBeInTheDocument();
	});

	it('shows timer when OTP cannot be resent', () => {
		// Mock API to return timer state
		mockGetOtpStatus.mockReturnValue({
			data: {
				canResend: false,
				remainingTime: 120,
				canResendAt: Math.floor(Date.now() / 1000) + 120,
			},
		});

		act(() => {
			renderOtpForm({
				otpTimer: {
					canResend: false,
					remainingTime: 120,
					canResendAt: Math.floor(Date.now() / 1000) + 120,
				},
			});
		});

		expect(screen.getByText('Resend OTP in 02:00')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Resend OTP' })).toBeDisabled();
	});

	it('shows "can resend" message when timer expires', () => {
		act(() => {
			renderOtpForm({
				otpTimer: {
					canResend: true,
					remainingTime: 0,
					canResendAt: null,
				},
			});
		});

		expect(screen.getByText('You can resend OTP now')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Resend OTP' })).not.toBeDisabled();
	});
});
