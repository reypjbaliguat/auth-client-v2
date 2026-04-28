import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';

interface Props {
	open: boolean;
	handleClose: () => void;
	isLinkingPassword: boolean;
	handleAccountLinking: () => void;
	passwordAccountLinkingEmail?: string | null; // Optional email for password linking scenarios
	type?: 'password-to-google' | 'google-to-password'; // Optional type to differentiate linking scenarios
}

function AccountLinkingModal({
	open,
	handleClose,
	isLinkingPassword,
	handleAccountLinking,
	passwordAccountLinkingEmail,
	type,
}: Props) {
	const isPasswordToGoogle = type === 'password-to-google';
	return (
		<Dialog onClose={handleClose} open={open}>
			<div className="p-4">
				{isPasswordToGoogle ? (
					<>
						<h3 className="font-semibold text-lg mb-2">Link Password to Google Account</h3>
						<p className="text-gray-700 mb-4">
							This email is already associated with a Google account. Would you like to add password
							login to your existing account?
						</p>
						<div className="flex gap-2">
							<Button
								variant="contained"
								onClick={handleAccountLinking}
								disabled={isLinkingPassword}
							>
								{isLinkingPassword ? 'Sending OTP...' : 'Yes, Add Password'}
							</Button>
							<Button variant="outlined" onClick={handleClose}>
								Cancel
							</Button>
						</div>
					</>
				) : (
					<>
						<h3 className="font-semibold text-lg mb-2">Link Google Account</h3>
						<p className="text-gray-700 mb-4">
							This email ({passwordAccountLinkingEmail}) already has a password account. Would you
							like to link your Google account to it?
						</p>
						<div className="flex gap-2">
							<Button
								variant="contained"
								onClick={handleAccountLinking}
								disabled={isLinkingPassword}
							>
								Yes, Link Google Account
							</Button>
							<Button variant="outlined" onClick={handleClose}>
								Use Password Instead
							</Button>
						</div>
					</>
				)}
			</div>
		</Dialog>
	);
}

export default AccountLinkingModal;
