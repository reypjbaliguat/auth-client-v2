import { setForgotPasswordStep } from '@/core/store/features/auth/authSlice';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ForgotPasswordEmailForm from './ForgotPasswordEmailForm';

const mockRouter = { push: vi.fn() };

vi.mock('next/navigation', () => ({
	useRouter: () => mockRouter,
}));

const { mockForgotPassword, mutationState } = vi.hoisted(() => {
	const mockForgotPassword = vi.fn();
	const mutationState: {
		isLoading: boolean;
		error: { status: number; data: { message?: string } } | undefined;
	} = {
		isLoading: false,
		error: undefined,
	};
	return { mockForgotPassword, mutationState };
});

vi.mock('@/core/store/api/authApi', () => ({
	useForgotPasswordMutation: () => [mockForgotPassword, mutationState],
}));

const mockDispatch = vi.fn();

vi.mock('@/core/store/hooks', () => ({
	useAppDispatch: () => mockDispatch,
}));

describe('ForgotPasswordEmailForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mutationState.isLoading = false;
		mutationState.error = undefined;
		mockForgotPassword.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue({ message: 'ok' }),
		});
	});

	it('renders heading, email field, and actions', () => {
		render(<ForgotPasswordEmailForm />);

		expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
		expect(screen.getByText(/please enter your email/i)).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByTestId('forgot-password-button')).toHaveTextContent('Submit');
		expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
	});

	it('shows validation error when email is empty', async () => {
		const user = userEvent.setup();
		render(<ForgotPasswordEmailForm />);

		await user.click(screen.getByTestId('forgot-password-button'));

		await waitFor(() => {
			expect(screen.getByText('Email is required')).toBeInTheDocument();
		});
		expect(mockForgotPassword).not.toHaveBeenCalled();
	});

	it('shows validation error for invalid email', async () => {
		const user = userEvent.setup();
		render(<ForgotPasswordEmailForm />);

		await user.type(screen.getByLabelText('Email'), 'not-an-email');
		await user.click(screen.getByTestId('forgot-password-button'));

		await waitFor(() => {
			expect(screen.getByText('Invalid email format')).toBeInTheDocument();
		});
		expect(mockForgotPassword).not.toHaveBeenCalled();
	});

	it('submits normalized email and advances step on success', async () => {
		const user = userEvent.setup();
		const unwrap = vi.fn().mockResolvedValue({ message: 'sent' });
		mockForgotPassword.mockReturnValue({ unwrap });

		render(<ForgotPasswordEmailForm />);

		await user.type(screen.getByLabelText('Email'), '  User@EXAMPLE.com  ');
		await user.click(screen.getByTestId('forgot-password-button'));

		await waitFor(() => {
			expect(mockForgotPassword).toHaveBeenCalledWith({ email: 'user@example.com' });
		});
		await waitFor(() => {
			expect(unwrap).toHaveBeenCalled();
		});
		await waitFor(() => {
			expect(mockDispatch).toHaveBeenCalledWith(
				setForgotPasswordStep({ step: 'Verify', email: 'user@example.com' })
			);
		});
	});

	it('shows API error message when mutation returns error with data.message', () => {
		mutationState.error = { status: 400, data: { message: 'No account for this email' } };

		render(<ForgotPasswordEmailForm />);

		expect(screen.getByRole('alert')).toHaveTextContent('No account for this email');
	});

	it('shows generic message when error has no data.message', () => {
		mutationState.error = { status: 500, data: {} };

		render(<ForgotPasswordEmailForm />);

		expect(screen.getByRole('alert')).toHaveTextContent('An error occurred');
	});

	it('Back to Login dispatches request step and navigates to sign-in', async () => {
		const user = userEvent.setup();
		render(<ForgotPasswordEmailForm />);

		await user.click(screen.getByRole('button', { name: /back to login/i }));

		expect(mockDispatch).toHaveBeenCalledWith(setForgotPasswordStep({ step: 'Request' }));
		expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
	});
});
