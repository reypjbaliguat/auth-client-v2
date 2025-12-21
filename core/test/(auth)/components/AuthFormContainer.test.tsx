import AuthFormContainer from '@/app/(auth)/components/AuthFormContainer';
import '@testing-library/jest-dom';
import { it } from 'node:test';
import { expect, test } from 'vitest';

test('AuthFormContainer Component', () => {
	it('should render AuthFormContainer with correct label', () => {
		const label = 'Login';
		const testChildText = 'Test Child';
		<AuthFormContainer label={label}>
			<div>Test Child</div>
		</AuthFormContainer>;
		expect(new RegExp(label)).toBeInTheDocument();
		expect(new RegExp(testChildText)).toBeInTheDocument();
	});
});
