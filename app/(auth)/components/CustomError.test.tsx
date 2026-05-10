import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CustomError from './CustomError';

vi.mock('@mui/material', () => ({
	Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
}));

describe('CustomError', () => {
	it('renders error message and wrapper styling', () => {
		render(<CustomError customError="Invalid credentials" />);

		const alert = screen.getByTestId('alert');
		expect(alert).toBeInTheDocument();
		expect(alert).toHaveTextContent('Invalid credentials');

		const wrapper = alert.parentElement;
		expect(wrapper).not.toBeNull();
		expect(wrapper).toHaveClass('basis-full', 'mb-4');
		expect(wrapper).not.toHaveClass('hidden');
	});

	it('renders with custom error message', () => {
		render(<CustomError customError="Network error occurred" />);
		expect(screen.getByTestId('alert')).toHaveTextContent('Network error occurred');
	});

	it('renders with hidden error message', () => {
		render(<CustomError customError="" />);
		const alert = screen.getByTestId('alert');
		expect(alert).toBeInTheDocument();
		expect(alert).toHaveTextContent('');

		const wrapper = alert.parentElement;
		expect(wrapper).not.toBeNull();
		expect(wrapper).toHaveClass('hidden');
	});
});
