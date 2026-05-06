import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuthForm from './AuthForm';

// Mock external dependencies
vi.mock('@react-oauth/google', () => ({
	GoogleOAuthProvider: ({
		children,
		clientId,
	}: {
		children: React.ReactNode;
		clientId: string;
	}) => (
		<div data-testid="google-oauth-provider" data-client-id={clientId}>
			{children}
		</div>
	),
}));

vi.mock('next/image', () => ({
	default: ({
		src,
		width,
		height,
		className,
		alt,
	}: {
		src: string;
		width: number;
		height: number;
		className?: string;
		alt: string;
	}) => (
		<img
			src={src}
			width={width}
			height={height}
			className={className}
			alt={alt}
			data-testid="auth-form-image"
		/>
	),
}));

vi.mock('@mui/material', () => ({
	Card: ({ children, className }: { children: React.ReactNode; className: string }) => (
		<div data-testid="auth-form-card" className={className}>
			{children}
		</div>
	),
	Alert: ({ severity, children }: { severity: string; children: React.ReactNode }) => (
		<div data-testid="alert" data-severity={severity}>
			{children}
		</div>
	),
	Box: ({
		children,
		component,
		onSubmit,
	}: {
		children: React.ReactNode;
		component?: string;
		onSubmit?: () => void;
	}) => (
		<div data-testid="form-box" data-component={component} onSubmit={onSubmit}>
			{children}
		</div>
	),
}));

describe('AuthForm', () => {
	const mockChildren = <div data-testid="mock-children">Test Content</div>;

	beforeEach(() => {
		// Set up environment variable for Google OAuth
		process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-google-client-id';
	});

	afterEach(() => {
		// Clean up after each test
		delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
		vi.clearAllMocks();
	});

	describe('Main AuthForm Component', () => {
		it('renders the main AuthForm with correct styling', () => {
			render(<AuthForm>{mockChildren}</AuthForm>);

			const card = screen.getByTestId('auth-form-card');
			expect(card).toBeInTheDocument();
			expect(card).toHaveClass(
				'md:p-10',
				'px-5',
				'py-7',
				'flex',
				'justify-center',
				'flex-col',
				'w-[300px]',
				'md:w-[500px]'
			);
			expect(screen.getByTestId('mock-children')).toBeInTheDocument();
		});

		it('renders children content inside the card', () => {
			const testContent = <span>Custom Auth Content</span>;
			render(<AuthForm>{testContent}</AuthForm>);

			expect(screen.getByText('Custom Auth Content')).toBeInTheDocument();
		});
	});

	describe('AuthForm.GoogleProvider', () => {
		it('renders GoogleOAuthProvider with correct client ID', () => {
			render(<AuthForm.GoogleProvider>{mockChildren}</AuthForm.GoogleProvider>);

			const provider = screen.getByTestId('google-oauth-provider');
			expect(provider).toBeInTheDocument();
			expect(provider).toHaveAttribute('data-client-id', 'test-google-client-id');
			expect(screen.getByTestId('mock-children')).toBeInTheDocument();
		});

		it('renders with empty string when GOOGLE_CLIENT_ID is not set', () => {
			delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

			render(<AuthForm.GoogleProvider>{mockChildren}</AuthForm.GoogleProvider>);

			const provider = screen.getByTestId('google-oauth-provider');
			expect(provider).toHaveAttribute('data-client-id', '');
		});
	});

	describe('AuthForm.AuthFormImage', () => {
		it('renders logo image with correct attributes', () => {
			render(<AuthForm.AuthFormImage />);

			const image = screen.getByTestId('auth-form-image');
			expect(image).toBeInTheDocument();
			expect(image).toHaveAttribute('src', '/assets/logo.png');
			expect(image).toHaveAttribute('width', '50');
			expect(image).toHaveAttribute('height', '50');
			expect(image).toHaveAttribute('alt', 'logo');
			expect(image).toHaveClass('mb-5');
		});
	});

	describe('AuthForm.AuthFormHeader', () => {
		it('renders header with correct text and styling', () => {
			render(<AuthForm.AuthFormHeader header="Sign In" />);

			const header = screen.getByRole('heading', { level: 6 });
			expect(header).toBeInTheDocument();
			expect(header).toHaveTextContent('Sign In');
			expect(header).toHaveClass('text-3xl', 'mb-5');
		});

		it('renders with custom header text', () => {
			render(<AuthForm.AuthFormHeader header="Create Account" />);

			expect(screen.getByText('Create Account')).toBeInTheDocument();
		});
	});

	describe('AuthForm.AuthFormLabel', () => {
		it('renders label with correct text and styling', () => {
			render(<AuthForm.AuthFormLabel label="Email Address" />);

			const label = screen.getByText('Email Address');
			expect(label).toBeInTheDocument();
			expect(label).toHaveClass('text-lg');
		});

		it('renders with custom label text', () => {
			render(<AuthForm.AuthFormLabel label="Password" />);

			expect(screen.getByText('Password')).toBeInTheDocument();
		});
	});

	describe('AuthForm.AuthFooter', () => {
		it('renders footer with children and correct styling', () => {
			render(<AuthForm.AuthFooter>{mockChildren}</AuthForm.AuthFooter>);

			const footer = screen.getByTestId('mock-children').parentElement;
			expect(footer).toBeInTheDocument();
			expect(footer).toHaveClass('flex', 'flex-col');
			expect(screen.getByTestId('mock-children')).toBeInTheDocument();
		});
	});

	describe('AuthForm.Form', () => {
		it('renders form with onSubmit handler', () => {
			const mockHandleSubmit = vi.fn();

			render(<AuthForm.Form handleSubmit={mockHandleSubmit}>{mockChildren}</AuthForm.Form>);

			const formBox = screen.getByTestId('form-box');
			expect(formBox).toBeInTheDocument();
			expect(formBox).toHaveAttribute('data-component', 'form');
			expect(screen.getByTestId('mock-children')).toBeInTheDocument();
		});

		it('renders form without handleSubmit (undefined)', () => {
			render(<AuthForm.Form handleSubmit={undefined}>{mockChildren}</AuthForm.Form>);

			const formBox = screen.getByTestId('form-box');
			expect(formBox).toBeInTheDocument();
		});
	});

	describe('AuthForm.FormFieldContainer', () => {
		it('renders container with correct styling', () => {
			render(<AuthForm.FormFieldContainer>{mockChildren}</AuthForm.FormFieldContainer>);

			const container = screen.getByTestId('mock-children').parentElement;
			expect(container).toBeInTheDocument();
			expect(container).toHaveClass('flex', 'flex-col', 'gap-y-2', 'my-4');
		});
	});

	describe('AuthForm.ErrorMessage', () => {
		it('renders error message with correct styling', () => {
			render(<AuthForm.ErrorMessage customError="Invalid credentials" />);

			const alert = screen.getByTestId('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveAttribute('data-severity', 'error');
			expect(alert).toHaveTextContent('Invalid credentials');

			const container = alert.parentElement;
			expect(container).toHaveClass('basis-full', 'mb-4');
		});

		it('renders with custom error message', () => {
			render(<AuthForm.ErrorMessage customError="Network error occurred" />);

			expect(screen.getByText('Network error occurred')).toBeInTheDocument();
		});
	});

	describe('AuthForm.SuccessMessage', () => {
		it('renders success message with correct styling', () => {
			render(<AuthForm.SuccessMessage customSuccess="Account created successfully" />);

			const alert = screen.getByTestId('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveAttribute('data-severity', 'success');
			expect(alert).toHaveTextContent('Account created successfully');

			const container = alert.parentElement;
			expect(container).toHaveClass('basis-full', 'mb-4');
		});

		it('renders with custom success message', () => {
			render(<AuthForm.SuccessMessage customSuccess="Password reset email sent" />);

			expect(screen.getByText('Password reset email sent')).toBeInTheDocument();
		});
	});

	describe('Compound Component Integration', () => {
		it('renders full auth form with all components', () => {
			const mockSubmit = vi.fn();

			render(
				<AuthForm>
					<AuthForm.GoogleProvider>
						<AuthForm.AuthFormImage />
						<AuthForm.AuthFormHeader header="Welcome Back" />
						<AuthForm.Form handleSubmit={mockSubmit}>
							<AuthForm.FormFieldContainer>
								<AuthForm.AuthFormLabel label="Email" />
								<input type="email" />
							</AuthForm.FormFieldContainer>
							<AuthForm.ErrorMessage customError="Test error" />
							<AuthForm.SuccessMessage customSuccess="Test success" />
						</AuthForm.Form>
						<AuthForm.AuthFooter>
							<button type="button">Footer Button</button>
						</AuthForm.AuthFooter>
					</AuthForm.GoogleProvider>
				</AuthForm>
			);

			// Verify all components are rendered
			expect(screen.getByTestId('google-oauth-provider')).toBeInTheDocument();
			expect(screen.getByTestId('auth-form-image')).toBeInTheDocument();
			expect(screen.getByText('Welcome Back')).toBeInTheDocument();
			expect(screen.getByTestId('form-box')).toBeInTheDocument();
			expect(screen.getByText('Email')).toBeInTheDocument();
			expect(screen.getByText('Test error')).toBeInTheDocument();
			expect(screen.getByText('Test success')).toBeInTheDocument();
			expect(screen.getByText('Footer Button')).toBeInTheDocument();
		});
	});

	describe('Component Accessibility', () => {
		it('has proper accessibility attributes for form elements', () => {
			render(
				<AuthForm>
					<AuthForm.AuthFormHeader header="Sign In Form" />
					<AuthForm.Form handleSubmit={vi.fn()}>
						<input type="email" aria-label="email" />
					</AuthForm.Form>
				</AuthForm>
			);

			expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Sign In Form');
			expect(screen.getByLabelText('email')).toBeInTheDocument();
		});
	});
});
