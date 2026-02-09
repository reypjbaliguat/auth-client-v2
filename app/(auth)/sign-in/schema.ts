import * as z from 'zod';

const schema = z.object({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, 'Email is required')
		.max(124, 'Email must only have maximum of 124 characters')
		.email('Invalid email format'),
	password: z.string().min(1, { message: 'Password is required.' }),
});

export default schema;

export type SignInFormData = z.infer<typeof schema>;
