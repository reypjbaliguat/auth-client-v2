import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ControllerRenderProps, FieldError } from 'react-hook-form';

import EmailField from './EmailField';

type FormValues = { email: string };

function makeField(value: string | undefined): ControllerRenderProps<FormValues, 'email'> {
	return {
		name: 'email',
		value,
		onChange: vi.fn(),
		onBlur: vi.fn(),
		ref: vi.fn(),
	} as unknown as ControllerRenderProps<FormValues, 'email'>;
}

describe('EmailField', () => {
	it('renders Email input and normalizes undefined value to empty string', () => {
		render(<EmailField<FormValues> field={makeField(undefined)} error={undefined} />);

		expect(screen.getByLabelText('Email')).toHaveValue('');
	});

	it('shows helper text and error state when error is provided', () => {
		const error: FieldError = { type: 'required', message: 'Email is required' };
		render(<EmailField<FormValues> field={makeField('')} error={error} />);

		expect(screen.getByText('Email is required')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
	});
});
