import { renderWithProviders } from '@/core/utils/renderWithProviders';
import type { RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';

// Custom render function that includes providers by default
export function customRender(
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'> & { preloadedState?: Partial<Record<string, unknown>> }
) {
	const { preloadedState, ...renderOptions } = options || {};

	return renderWithProviders(ui, preloadedState);
}

// Mock data for tests
export const mockAuthState = {
	user: null,
	token: null,
	isLoading: false,
	error: null,
};

export const mockUser = {
	id: '1',
	email: 'test@example.com',
	name: 'Test User',
	isVerified: true,
};

// Common test utilities
export const waitForLoadingToFinish = () => new Promise((resolve) => setTimeout(resolve, 0));

export const createMockEvent = (value: string) => ({
	target: { value },
	preventDefault: vi.fn(),
	stopPropagation: vi.fn(),
});
