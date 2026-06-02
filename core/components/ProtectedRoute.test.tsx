import type { AuthState } from '@/core/store/features/auth';
import { renderWithProviders } from '@/core/utils/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProtectedRoute from './ProtectedRoute';

const mockRouter = {
	replace: vi.fn(),
	push: vi.fn(),
	prefetch: vi.fn(),
	refresh: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
};

vi.mock('next/navigation', () => ({
	useRouter: () => mockRouter,
}));

const makeAuthState = (overrides?: Partial<AuthState>): AuthState => ({
	isAuthenticated: false,
	loading: false,
	user: null,
	step: 'Login',
	forgotPasswordEmail: null,
	forgotPasswordStep: 'Request',
	otpEmail: null,
	otpTimer: {
		canResend: true,
		remainingTime: 0,
		canResendAt: null,
	},
	isPasswordToGoogleLinking: false,
	isGoogleToPasswordLinking: false,
	...overrides,
});

describe('ProtectedRoute', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows loader while auth check is in progress and does not redirect', () => {
		const { container } = renderWithProviders(
			<ProtectedRoute>
				<div data-testid="protected-content">Protected Content</div>
			</ProtectedRoute>,
			{
				auth: makeAuthState({ loading: true, isAuthenticated: false }),
			}
		);

		expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
		expect(container.querySelector('.h-screen')).toBeInTheDocument();
		expect(mockRouter.replace).not.toHaveBeenCalled();
	});

	it('redirects unauthenticated users to /sign-in when not loading', async () => {
		renderWithProviders(
			<ProtectedRoute>
				<div data-testid="protected-content">Protected Content</div>
			</ProtectedRoute>,
			{
				auth: makeAuthState({ loading: false, isAuthenticated: false }),
			}
		);

		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalledWith('/sign-in');
		});
	});

	it('renders children and does not redirect for authenticated users', async () => {
		renderWithProviders(
			<ProtectedRoute>
				<div data-testid="protected-content">Protected Content</div>
			</ProtectedRoute>,
			{
				auth: makeAuthState({ loading: false, isAuthenticated: true }),
			}
		);

		expect(screen.getByTestId('protected-content')).toBeInTheDocument();

		await waitFor(() => {
			expect(mockRouter.replace).not.toHaveBeenCalled();
		});
	});
});
