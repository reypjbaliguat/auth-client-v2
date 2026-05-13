import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ControllerRenderProps, FieldError } from 'react-hook-form';

import PasswordField from './PasswordField';

type FormValues = { password: string };

function makeField(value: string | undefined): ControllerRenderProps<FormValues, 'password'> {
	return {
		name: 'password',
		value,
		onChange: vi.fn(),
		onBlur: vi.fn(),
		ref: vi.fn(),
	} as unknown as ControllerRenderProps<FormValues, 'password'>;
}

describe('PasswordField', () => {
	it('renders Password input and normalizes undefined value to empty string', () => {
		render(
			<PasswordField<FormValues> field={makeField(undefined)} error={undefined} label="Password" />
		);

		expect(screen.getByLabelText('Password')).toHaveValue('');
	});

	it('shows helper text and error state when error is provided', () => {
		const error: FieldError = { type: 'required', message: 'Password is required' };
		render(<PasswordField<FormValues> field={makeField('')} error={error} label="Password" />);

		expect(screen.getByText('Password is required')).toBeInTheDocument();
		expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
	});

	it('uses password type until visibility toggle is clicked', async () => {
		const user = userEvent.setup();
		render(
			<PasswordField<FormValues> field={makeField('secret')} error={undefined} label="Password" />
		);

		const input = screen.getByLabelText('Password');
		expect(input).toHaveAttribute('type', 'password');

		const toggle = screen.getByRole('button');
		await user.click(toggle);

		expect(input).toHaveAttribute('type', 'text');

		await user.click(toggle);

		expect(input).toHaveAttribute('type', 'password');
	});

	it('renders Confirm Password label when passed', () => {
		render(
			<PasswordField<FormValues>
				field={makeField(undefined)}
				error={undefined}
				label="Confirm Password"
			/>
		);

		expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
	});
});
