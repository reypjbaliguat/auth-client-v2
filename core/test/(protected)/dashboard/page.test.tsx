import DashboardPage from '@/app/(protected)/dashboard/page';
import { renderWithProviders } from '@/core/test/utils/renderWithProviders';
import { useRouter } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

describe('DashboardPage', () => {
	it('redirects to /sign-in when user is not authenticated', () => {
		const router = useRouter();
		const replaceSpy = vi.spyOn(router, 'replace');

		renderWithProviders(<DashboardPage />, {
			auth: {
				isAuthenticated: false,
				loading: false,
				user: null,
			},
		});

		expect(replaceSpy).toHaveBeenCalledWith('/sign-in');
	});
});
