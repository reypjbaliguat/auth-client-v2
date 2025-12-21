import { Button } from '@mui/material';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { useState } from 'react';
import AuthFormContainer from './AuthFormContainer';

interface Props {
	email: string;
}
function OtpForm({ email }: Props) {
	const [otp, setOtp] = useState('');
	const handleChange = (newValue: string) => {
		setOtp(newValue);
	};
	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		// Handle OTP submission logic here
		console.log('OTP submitted:', otp, email);
	};
	return (
		<AuthFormContainer label="OTP Verification">
			<div className="flex flex-col gap-y-4">
				<MuiOtpInput value={otp} length={6} display={'flex'} gap={'5px'} onChange={handleChange} />
				<Button variant="contained" color="primary" onClick={handleSubmit}>
					Verify OTP
				</Button>
			</div>
		</AuthFormContainer>
	);
}

export default OtpForm;
