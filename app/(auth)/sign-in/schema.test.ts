import { describe, expect, it } from 'vitest';
import schema, { type SignInFormData } from './schema';

describe('SignIn Form Contract', () => {
	it('accepts valid email and password', () => {
		const validData: SignInFormData = {
			email: 'user@example.com',
			password: 'password123',
		};

		const result = schema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects invalid data', () => {
		const invalidCases = [
			{ email: '', password: 'password' }, // empty email
			{ email: 'user@example.com', password: '' }, // empty password
			{ email: 'not-an-email', password: 'password' }, // invalid email format
		];

		invalidCases.forEach((data) => {
			const result = schema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	it('rejects excessively long email', () => {
		const longEmail = 'a'.repeat(120) + '@example.com'; // Over 124 chars
		const data = { email: longEmail, password: 'password' };

		const result = schema.safeParse(data);
		expect(result.success).toBe(false);
	});
});
