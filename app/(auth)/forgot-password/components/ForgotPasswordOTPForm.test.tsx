import { setForgotPasswordStep } from '@/core/store/features';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import ForgotPasswordOTPForm from './ForgotPasswordOTPForm';

const mockRouter = { push: vi.fn() };

vi.mock('next/navigation', () => ({
	useRouter: () => mockRouter,
}));

vi.mock('mui-one-time-password-input', () => ({
	MuiOtpInput: ({
		value,
		onChange,
		length = 6,
	}: {
		value: string;
		onChange: (v: string) => void;
		length?: number;
	}) => (
		<input
			aria-label="OTP code"
			data-testid="otp-mock-input"
			value={value}
			onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
		/>
	),
}));

const { mockResetPassword, otpTimerState } = vi.hoisted(() => {
	const mockResetPassword = vi.fn();
	const otpTimerState = {
		canResend: true,
		remainingTime: 0,
		canResendAt: null as number | null,
	};
	return { mockResetPassword, otpTimerState };
});

vi.mock('@/core/store/api/authApi', () => ({
	useResetPasswordMutation: () => [mockResetPassword, { isLoading: false }],
}));

const mockDispatch = vi.fn();

vi.mock('@/core/store/hooks', () => ({
	useAppDispatch: () => mockDispatch,
	useAppSelector: (selector: (state: { auth: { otpTimer: typeof otpTimerState } }) => unknown) =>
		selector({ auth: { otpTimer: otpTimerState } }),
}));

describe('ForgotPasswordOTPForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		otpTimerState.canResend = true;
		otpTimerState.remainingTime = 0;
		otpTimerState.canResendAt = null;
		mockResetPassword.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue({ message: 'ok' }),
		});
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	const fillValidForm = async (user: ReturnType<typeof userEvent.setup>, email: string) => {
		render(<ForgotPasswordOTPForm email={email} />);
		await user.type(screen.getByTestId('otp-mock-input'), '123456');
		await user.type(screen.getByLabelText('New Password'), 'secret12');
		await user.type(screen.getByLabelText('Confirm New Password'), 'secret12');
	};

	it('renders reset flow copy, OTP, password fields, and actions', () => {
		render(<ForgotPasswordOTPForm email="user@example.com" />);

		expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
		expect(
			screen.getByText(/please enter the otp sent to your email and create a new password/i)
		).toBeInTheDocument();
		expect(screen.getByTestId('otp-mock-input')).toBeInTheDocument();
		expect(screen.getByLabelText('New Password')).toBeInTheDocument();
		expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /^reset password$/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /resend otp/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
	});

	it('keeps submit disabled until OTP has 6 digits', async () => {
		const user = userEvent.setup();
		render(<ForgotPasswordOTPForm email="user@example.com" />);

		const submit = screen.getByRole('button', { name: /^reset password$/i });
		expect(submit).toBeDisabled();

		await user.type(screen.getByTestId('otp-mock-input'), '12345');
		expect(submit).toBeDisabled();

		await user.type(screen.getByTestId('otp-mock-input'), '6');
		expect(submit).not.toBeDisabled();
	});

	it('does not call reset mutation when email prop is missing', async () => {
		const user = userEvent.setup();
		render(<ForgotPasswordOTPForm email={undefined} />);

		await user.type(screen.getByTestId('otp-mock-input'), '123456');
		await user.type(screen.getByLabelText('New Password'), 'secret12');
		await user.type(screen.getByLabelText('Confirm New Password'), 'secret12');
		await user.click(screen.getByRole('button', { name: /^reset password$/i }));

		await waitFor(() => {
			expect(mockResetPassword).not.toHaveBeenCalled();
		});
	});

	it('calls reset password and navigates to sign-in on success', async () => {
		const user = userEvent.setup();
		const unwrap = vi.fn().mockResolvedValue({ message: 'reset ok' });
		mockResetPassword.mockReturnValue({ unwrap });

		await fillValidForm(user, 'user@example.com');
		await user.click(screen.getByRole('button', { name: /^reset password$/i }));

		await waitFor(() => {
			expect(mockResetPassword).toHaveBeenCalledWith({
				email: 'user@example.com',
				otp: '123456',
				password: 'secret12',
			});
		});
		expect(unwrap).toHaveBeenCalled();
		expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
	});

	it('shows error alert when reset password fails', async () => {
		const user = userEvent.setup();
		const unwrap = vi.fn().mockRejectedValue(new Error('network'));
		mockResetPassword.mockReturnValue({ unwrap });

		await fillValidForm(user, 'user@example.com');
		await user.click(screen.getByRole('button', { name: /^reset password$/i }));

		await waitFor(() => {
			expect(screen.getByRole('alert')).toHaveTextContent(
				'Failed to reset password. Please try again.'
			);
		});
	});

	it('shows zod error when passwords do not match', async () => {
		const user = userEvent.setup();
		render(<ForgotPasswordOTPForm email="user@example.com" />);

		await user.type(screen.getByTestId('otp-mock-input'), '123456');
		await user.type(screen.getByLabelText('New Password'), 'secret12');
		await user.type(screen.getByLabelText('Confirm New Password'), 'secret99');
		await user.click(screen.getByRole('button', { name: /^reset password$/i }));

		await waitFor(() => {
			expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
		});
		expect(mockResetPassword).not.toHaveBeenCalled();
	});

	it('Back to Login navigates and resets forgot-password step', async () => {
		const user = userEvent.setup();
		render(<ForgotPasswordOTPForm email="user@example.com" />);

		await user.click(screen.getByRole('button', { name: /back to login/i }));

		expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
		expect(mockDispatch).toHaveBeenCalledWith(
			setForgotPasswordStep({ step: 'Request', email: null })
		);
	});

	it('shows countdown when OTP cannot be resent yet', () => {
		otpTimerState.canResend = false;
		otpTimerState.remainingTime = 125;

		render(<ForgotPasswordOTPForm email="user@example.com" />);

		expect(screen.getByText(/resend otp in 02:05/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /resend otp/i })).toBeDisabled();
	});

	it('shows resend-ready copy when timer allows resend', () => {
		otpTimerState.canResend = true;

		render(<ForgotPasswordOTPForm email="user@example.com" />);

		expect(screen.getByText(/you can resend otp now/i)).toBeInTheDocument();
	});

	it('Resend OTP shows success message then clears after timeout', () => {
		vi.useFakeTimers();

		render(<ForgotPasswordOTPForm email="user@example.com" />);

		fireEvent.click(screen.getByRole('button', { name: /resend otp/i }));

		expect(screen.getByRole('alert')).toHaveTextContent('OTP sent successfully!');

		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(screen.queryByText('OTP sent successfully!')).not.toBeInTheDocument();
	});
});
