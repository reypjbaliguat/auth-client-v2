import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js Image component
vi.mock('next/image', () => ({
	__esModule: true,
	default: (props: { alt?: string }) => {
		// eslint-disable-next-line @next/next/no-img-element
		return <img {...props} alt={props.alt} />;
	},
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
	__esModule: true,
	default: ({ children, ...props }: { children?: React.ReactNode }) => {
		return <a {...props}>{children}</a>;
	},
}));

// Mock environment variables
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-google-client-id';

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));
