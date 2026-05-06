import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccountLinkingModal from './AccountLinkingModal';

describe('AccountLinkingModal', () => {
	const mockHandleClose = vi.fn();
	const mockHandleAccountLinking = vi.fn();

	const defaultProps = {
		open: true,
		handleClose: mockHandleClose,
		isLinkingPassword: false,
		handleAccountLinking: mockHandleAccountLinking,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('Dialog visibility', () => {
		it('renders when open is true', () => {
			render(<AccountLinkingModal {...defaultProps} />);

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('does not render when open is false', () => {
			render(<AccountLinkingModal {...defaultProps} open={false} />);

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Password to Google linking (password-to-google type)', () => {
		const passwordToGoogleProps = {
			...defaultProps,
			type: 'password-to-google' as const,
		};

		it('renders correct heading and message', () => {
			render(<AccountLinkingModal {...passwordToGoogleProps} />);

			expect(screen.getByText('Link Password to Google Account')).toBeInTheDocument();
			expect(
				screen.getByText(/This email is already associated with a Google account/)
			).toBeInTheDocument();
			expect(
				screen.getByText(/Would you like to add password login to your existing account/)
			).toBeInTheDocument();
		});

		it('renders correct buttons', () => {
			render(<AccountLinkingModal {...passwordToGoogleProps} />);

			expect(screen.getByRole('button', { name: 'Yes, Add Password' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
		});

		it('calls handleAccountLinking when "Yes, Add Password" button is clicked', async () => {
			const user = userEvent.setup();
			render(<AccountLinkingModal {...passwordToGoogleProps} />);

			await user.click(screen.getByRole('button', { name: 'Yes, Add Password' }));

			expect(mockHandleAccountLinking).toHaveBeenCalledTimes(1);
		});

		it('calls handleClose when Cancel button is clicked', async () => {
			const user = userEvent.setup();
			render(<AccountLinkingModal {...passwordToGoogleProps} />);

			await user.click(screen.getByRole('button', { name: 'Cancel' }));

			expect(mockHandleClose).toHaveBeenCalledTimes(1);
		});

		it('shows loading state when isLinkingPassword is true', () => {
			render(<AccountLinkingModal {...passwordToGoogleProps} isLinkingPassword={true} />);

			expect(screen.getByRole('button', { name: 'Sending OTP...' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Sending OTP...' })).toBeDisabled();
		});
	});

	describe('Google to Password linking (google-to-password type)', () => {
		const googleToPasswordProps = {
			...defaultProps,
			type: 'google-to-password' as const,
			passwordAccountLinkingEmail: 'test@example.com',
		};

		it('renders correct heading and message with email', () => {
			render(<AccountLinkingModal {...googleToPasswordProps} />);

			expect(screen.getByText('Link Google Account')).toBeInTheDocument();
			expect(
				screen.getByText(/This email \(test@example.com\) already has a password account/)
			).toBeInTheDocument();
			expect(
				screen.getByText(/Would you like to link your Google account to it/)
			).toBeInTheDocument();
		});

		it('renders correct buttons', () => {
			render(<AccountLinkingModal {...googleToPasswordProps} />);

			expect(screen.getByRole('button', { name: 'Yes, Link Google Account' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Use Password Instead' })).toBeInTheDocument();
		});

		it('calls handleAccountLinking when "Yes, Link Google Account" button is clicked', async () => {
			const user = userEvent.setup();
			render(<AccountLinkingModal {...googleToPasswordProps} />);

			await user.click(screen.getByRole('button', { name: 'Yes, Link Google Account' }));

			expect(mockHandleAccountLinking).toHaveBeenCalledTimes(1);
		});

		it('calls handleClose when "Use Password Instead" button is clicked', async () => {
			const user = userEvent.setup();
			render(<AccountLinkingModal {...googleToPasswordProps} />);

			await user.click(screen.getByRole('button', { name: 'Use Password Instead' }));

			expect(mockHandleClose).toHaveBeenCalledTimes(1);
		});

		it('disables link button when isLinkingPassword is true', () => {
			render(<AccountLinkingModal {...googleToPasswordProps} isLinkingPassword={true} />);

			expect(screen.getByRole('button', { name: 'Yes, Link Google Account' })).toBeDisabled();
		});
	});

	describe('Default behavior (without explicit type)', () => {
		const defaultTypeProps = {
			...defaultProps,
			passwordAccountLinkingEmail: 'user@example.com',
		};

		it('defaults to google-to-password flow when no type is specified', () => {
			render(<AccountLinkingModal {...defaultTypeProps} />);

			expect(screen.getByText('Link Google Account')).toBeInTheDocument();
			expect(
				screen.getByText(/This email \(user@example.com\) already has a password account/)
			).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Yes, Link Google Account' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Use Password Instead' })).toBeInTheDocument();
		});
	});

	describe('Modal interaction', () => {
		it('calls handleClose when dialog backdrop is clicked', async () => {
			const user = userEvent.setup();
			render(<AccountLinkingModal {...defaultProps} />);

			// Click on the backdrop (outside the modal content)
			const dialog = screen.getByRole('dialog');
			const backdrop = dialog.parentElement;

			expect(backdrop).toBeInTheDocument();
			await user.click(backdrop!);

			expect(mockHandleClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Edge cases', () => {
		it('handles missing passwordAccountLinkingEmail gracefully', () => {
			const propsWithoutEmail = {
				...defaultProps,
				type: 'google-to-password' as const,
				passwordAccountLinkingEmail: null,
			};

			render(<AccountLinkingModal {...propsWithoutEmail} />);

			expect(
				screen.getByText(/This email \(\) already has a password account/)
			).toBeInTheDocument();
		});

		it('handles undefined passwordAccountLinkingEmail gracefully', () => {
			const propsWithoutEmail = {
				...defaultProps,
				type: 'google-to-password' as const,
				passwordAccountLinkingEmail: undefined,
			};

			render(<AccountLinkingModal {...propsWithoutEmail} />);

			expect(
				screen.getByText(/This email \(\) already has a password account/)
			).toBeInTheDocument();
		});
	});
});
