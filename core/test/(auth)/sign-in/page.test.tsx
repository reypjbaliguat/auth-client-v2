import SignInPage from '@/app/(auth)/sign-in/page';
import '@testing-library/jest-dom';
import { it } from 'node:test';
import { expect, test } from 'vitest';

test('Sign In Page', () => {
	it('should render sign-in page correctly', () => {
		<SignInPage />;

		const text = 'Login';
		expect(text).toBeInTheDocument();
	});
});
