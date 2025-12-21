import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import Button from './Button';

test('renders and handles click', async () => {
	const user = userEvent.setup();
	const mockFn = vi.fn();

	render(<Button onClick={mockFn}>Click me</Button>);

	await user.click(screen.getByText('Click me'));
	expect(mockFn).toHaveBeenCalled();
});
