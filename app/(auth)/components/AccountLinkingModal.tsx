import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';

interface Props {
	open: boolean;
	handleClose: () => void;
	isLinkingPassword: boolean;
	handleAccountLinking: () => void;
}

function AccountLinkingModal({
	open,
	handleClose,
	isLinkingPassword,
	handleAccountLinking,
}: Props) {
	return (
		<Dialog onClose={handleClose} open={open}>
			<div className="p-4">
				<h3 className="font-semibold text-lg mb-2">Link Password to Google Account</h3>
				<p className="text-gray-700 mb-4">
					This email is already associated with a Google account. Would you like to add password
					login to your existing account?
				</p>
				<div className="flex gap-2">
					<Button variant="contained" onClick={handleAccountLinking} disabled={isLinkingPassword}>
						{isLinkingPassword ? 'Sending OTP...' : 'Yes, Add Password'}
					</Button>
					<Button variant="outlined" onClick={handleClose}>
						Cancel
					</Button>
				</div>
			</div>
		</Dialog>
	);
}

export default AccountLinkingModal;
