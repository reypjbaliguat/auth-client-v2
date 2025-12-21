import { vi } from 'vitest';

// Mock next/navigation for App Router
vi.mock('next/navigation', () => {
	const push = vi.fn();
	const replace = vi.fn();
	const back = vi.fn();
	const forward = vi.fn();
	const refresh = vi.fn();

	return {
		useRouter: () => ({ push, replace, back, forward, refresh }),
	};
});
