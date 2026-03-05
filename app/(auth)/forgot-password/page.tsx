'use client';

import {
	selectForgotPasswordEmail,
	selectForgotPasswordStep,
} from '@/core/store/features/auth/authSelectors';
import { useAppSelector } from '@/core/store/hooks';
import { Card } from '@mui/material';
import ForgotPasswordEmailForm from './components/ForgotPasswordEmailForm';
import ForgotPasswordOTPForm from './components/ForgotPasswordOTPForm';

function ForgotPasswordPage() {
	const forgotPasswordStep = useAppSelector(selectForgotPasswordStep);
	const forgotPasswordEmail = useAppSelector(selectForgotPasswordEmail);
	return (
		<Card className="md:p-10 px-5 py-7 flex justify-center flex-col w-[300px] md:w-[500px]">
			{forgotPasswordStep === 'Request' ? (
				<ForgotPasswordEmailForm />
			) : (
				<ForgotPasswordOTPForm email={forgotPasswordEmail} />
			)}
		</Card>
	);
}

export default ForgotPasswordPage;
