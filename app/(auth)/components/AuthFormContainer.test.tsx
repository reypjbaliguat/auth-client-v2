import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuthFormContainer from './AuthFormContainer';

// Mock the GoogleOAuthProvider to avoid API calls during testing
vi.mock('@react-oauth/google', () => ({
	GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="google-oauth-provider">{children}</div>
	),
}));

describe('AuthFormContainer', () => {
	const mockChildren = <div data-testid="mock-children">Test Content</div>;

	beforeEach(() => {
		// Set up environment variable for each test
		process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-google-client-id';
	});

	afterEach(() => {
		// Clean up after each test
		delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
	});

	describe('Login variant', () => {
		it('renders login form container with correct elements', () => {
			render(<AuthFormContainer label="Login">{mockChildren}</AuthFormContainer>);

			// Check for main elements
			expect(screen.getByText('Login')).toBeInTheDocument();
			expect(screen.getByText('Please enter your login info')).toBeInTheDocument();
			expect(screen.getByText('Do you need an account?')).toBeInTheDocument();
			expect(screen.getByTestId('mock-children')).toBeInTheDocument();
			expect(screen.getByTestId('google-oauth-provider')).toBeInTheDocument();
		});

		it('renders logo with correct attributes', () => {
			render(<AuthFormContainer label="Login">{mockChildren}</AuthFormContainer>);

			const logo = screen.getByAltText('logo');
			expect(logo).toBeInTheDocument();
			expect(logo).toHaveAttribute('src', '/assets/logo.png');
			expect(logo).toHaveAttribute('width', '50');
			expect(logo).toHaveAttribute('height', '50');
		});

		it('renders sign-up link with correct href', () => {
			render(<AuthFormContainer label="Login">{mockChildren}</AuthFormContainer>);

			const signUpLink = screen.getByText('Do you need an account?');
			expect(signUpLink).toBeInTheDocument();
			expect(signUpLink.closest('a')).toHaveAttribute('href', '/sign-up');
		});
	});

	describe('Register variant', () => {
		it('renders register form container with correct elements', () => {
			render(<AuthFormContainer label="Register">{mockChildren}</AuthFormContainer>);

			// Check for main elements
			expect(screen.getByText('Register')).toBeInTheDocument();
			expect(screen.queryByText('Please enter your login info')).not.toBeInTheDocument();
			expect(screen.getByText('Already have an account?')).toBeInTheDocument();
			expect(screen.getByTestId('mock-children')).toBeInTheDocument();
		});

		it('renders sign-in link with correct href', () => {
			render(<AuthFormContainer label="Register">{mockChildren}</AuthFormContainer>);

			const signInLink = screen.getByText('Already have an account?');
			expect(signInLink).toBeInTheDocument();
			expect(signInLink.closest('a')).toHaveAttribute('href', '/sign-in');
		});
	});

	describe('OTP Verification variant', () => {
		it('renders OTP verification container with correct elements', () => {
			render(<AuthFormContainer label="OTP Verification">{mockChildren}</AuthFormContainer>);

			// Check for main elements
			expect(screen.getByText('OTP Verification')).toBeInTheDocument();
			expect(screen.queryByText('Please enter your login info')).not.toBeInTheDocument();
			expect(screen.queryByText('Do you need an account?')).not.toBeInTheDocument();
			expect(screen.queryByText('Already have an account?')).not.toBeInTheDocument();
			expect(screen.getByTestId('mock-children')).toBeInTheDocument();
		});
	});

	describe('Environment and integration', () => {
		it('renders without crashing when Google client ID is missing', () => {
			delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

			expect(() => {
				render(<AuthFormContainer label="Login">{mockChildren}</AuthFormContainer>);
			}).not.toThrow();

			// Component should still render its main content
			expect(screen.getByText('Login')).toBeInTheDocument();
		});
	});

	describe('Component state and behavior', () => {
		it('shows different navigation links based on label prop', () => {
			const { rerender } = render(
				<AuthFormContainer label="Login">{mockChildren}</AuthFormContainer>
			);

			// Login shows sign-up link
			expect(screen.getByText('Do you need an account?')).toBeInTheDocument();
			expect(screen.queryByText('Already have an account?')).not.toBeInTheDocument();

			// Register shows sign-in link
			rerender(<AuthFormContainer label="Register">{mockChildren}</AuthFormContainer>);
			expect(screen.getByText('Already have an account?')).toBeInTheDocument();
			expect(screen.queryByText('Do you need an account?')).not.toBeInTheDocument();

			// OTP shows no navigation links
			rerender(<AuthFormContainer label="OTP Verification">{mockChildren}</AuthFormContainer>);
			expect(screen.queryByText('Do you need an account?')).not.toBeInTheDocument();
			expect(screen.queryByText('Already have an account?')).not.toBeInTheDocument();
		});

		it('displays subtitle only for login variant', () => {
			const { rerender } = render(
				<AuthFormContainer label="Login">{mockChildren}</AuthFormContainer>
			);
			expect(screen.getByText('Please enter your login info')).toBeInTheDocument();

			rerender(<AuthFormContainer label="Register">{mockChildren}</AuthFormContainer>);
			expect(screen.queryByText('Please enter your login info')).not.toBeInTheDocument();

			rerender(<AuthFormContainer label="OTP Verification">{mockChildren}</AuthFormContainer>);
			expect(screen.queryByText('Please enter your login info')).not.toBeInTheDocument();
		});
	});

	describe('Children rendering', () => {
		it('renders children content correctly', () => {
			const customChildren = (
				<div>
					<input data-testid="email-input" type="email" />
					<input data-testid="password-input" type="password" />
					<button data-testid="submit-button">Submit</button>
				</div>
			);

			render(<AuthFormContainer label="Login">{customChildren}</AuthFormContainer>);

			expect(screen.getByTestId('email-input')).toBeInTheDocument();
			expect(screen.getByTestId('password-input')).toBeInTheDocument();
			expect(screen.getByTestId('submit-button')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has proper heading structure', () => {
			render(<AuthFormContainer label="Login">{mockChildren}</AuthFormContainer>);

			const heading = screen.getByRole('heading', { name: 'Login' });
			expect(heading).toBeInTheDocument();
			expect(heading.tagName).toBe('H6');
		});

		it('has proper link accessibility', () => {
			render(<AuthFormContainer label="Login">{mockChildren}</AuthFormContainer>);

			const signUpLink = screen.getByRole('link', { name: 'Do you need an account?' });
			expect(signUpLink).toBeInTheDocument();
			expect(signUpLink).toHaveAttribute('href', '/sign-up');
		});
	});
});
