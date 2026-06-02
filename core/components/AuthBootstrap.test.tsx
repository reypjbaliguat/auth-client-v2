import { renderWithProviders } from '@/core/utils/renderWithProviders';
import { waitFor } from '@testing-library/react';
import Cookies from 'js-cookie';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthBootstrap from './AuthBootstrap';

const mockTriggerGetCurrentUser = vi.fn();

vi.mock('@/core/store/api/authApi', () => ({
	useLazyGetCurrentUserQuery: () => [mockTriggerGetCurrentUser],
}));

vi.mock('js-cookie', () => ({
	default: {
		get: vi.fn(),
		remove: vi.fn(),
	},
}));

describe('AuthBootstrap', () => {
	const mockUser = {
		_id: 'user-1',
		email: 'bootstrap@example.com',
		isActive: true,
		emailVerified: true,
		createdAt: new Date().toISOString(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('marks unauthenticated and skips user fetch when no token cookies exist', async () => {
		vi.mocked(Cookies.get).mockReturnValue(undefined);

		const { store } = renderWithProviders(<AuthBootstrap />);

		await waitFor(() => {
			expect(store.getState().auth.isAuthenticated).toBe(false);
			expect(store.getState().auth.loading).toBe(false);
		});

		expect(mockTriggerGetCurrentUser).not.toHaveBeenCalled();
	});

	it('hydrates authenticated user when getCurrentUser succeeds', async () => {
		vi.mocked(Cookies.get).mockImplementation((key: string) => {
			if (key === 'token') {
				return 'access-token';
			}
			return undefined;
		});

		mockTriggerGetCurrentUser.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue(mockUser),
		});

		const { store } = renderWithProviders(<AuthBootstrap />);

		await waitFor(() => {
			expect(store.getState().auth.isAuthenticated).toBe(true);
			expect(store.getState().auth.user).toEqual(mockUser);
			expect(store.getState().auth.loading).toBe(false);
		});

		expect(mockTriggerGetCurrentUser).toHaveBeenCalledTimes(1);
		expect(Cookies.remove).not.toHaveBeenCalled();
	});

	it('clears cookies and sets unauthenticated when getCurrentUser fails', async () => {
		vi.mocked(Cookies.get).mockImplementation((key: string) => {
			if (key === 'token') {
				return 'expired-access-token';
			}
			if (key === 'refreshToken') {
				return 'expired-refresh-token';
			}
			return undefined;
		});

		mockTriggerGetCurrentUser.mockReturnValue({
			unwrap: vi.fn().mockRejectedValue(new Error('unauthorized')),
		});

		const { store } = renderWithProviders(<AuthBootstrap />);

		await waitFor(() => {
			expect(store.getState().auth.isAuthenticated).toBe(false);
			expect(store.getState().auth.user).toBeNull();
			expect(store.getState().auth.loading).toBe(false);
		});

		expect(Cookies.remove).toHaveBeenCalledWith('token', { path: '/' });
		expect(Cookies.remove).toHaveBeenCalledWith('refreshToken', { path: '/' });
	});

	it('runs bootstrap once per mount and runs again after remount', async () => {
		vi.mocked(Cookies.get).mockImplementation((key: string) => {
			if (key === 'token') {
				return 'access-token';
			}
			return undefined;
		});

		mockTriggerGetCurrentUser.mockReturnValue({
			unwrap: vi.fn().mockResolvedValue(mockUser),
		});

		const firstRender = renderWithProviders(<AuthBootstrap />);

		await waitFor(() => {
			expect(mockTriggerGetCurrentUser).toHaveBeenCalledTimes(1);
		});

		firstRender.unmount();
		renderWithProviders(<AuthBootstrap />);

		await waitFor(() => {
			expect(mockTriggerGetCurrentUser).toHaveBeenCalledTimes(2);
		});
	});
});
