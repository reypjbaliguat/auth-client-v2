import * as z from 'zod';

const schema = z.object({
	email: z
		.email()
		.min(1, { message: 'This field is required.' })
		.max(124, 'Email must only have maximum of 124 characters'),
	password: z.string().min(1, { message: 'This field is required.' }),
});

export default schema;

export type SignInFormData = z.infer<typeof schema>;
