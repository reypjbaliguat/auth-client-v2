import * as z from 'zod';

const schema = z
	.object({
		otp: z
			.string()
			.min(1, { message: 'This field is required.' })
			.max(6, { message: 'OTP must be 6 characters' }),
		password: z.string().min(1, { message: 'This field is required.' }),
		confirmPassword: z.string().min(1, { message: 'This field is required.' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

export default schema;

export type ConfirmResetPasswordFormData = z.infer<typeof schema>;
