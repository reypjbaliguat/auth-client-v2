import * as z from 'zod';

const schema = z
	.object({
		email: z
			.string()
			.min(1, { message: 'This field is required.' })
			.email({ message: 'Invalid email format' })
			.max(124, 'Email must only have maximum of 124 characters'),
		password: z.string().min(1, { message: 'This field is required.' }),
		confirmPassword: z.string().min(1, { message: 'This field is required.' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

export default schema;

export type SignUpFormData = z.infer<typeof schema>;
