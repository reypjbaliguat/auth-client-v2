import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';

interface Props {
	open: boolean;
	handleClose: () => void;
}

function AccountLinkingModal({ open, handleClose }: Props) {
	return (
		<Dialog onClose={handleClose} open={open}>
			<DialogTitle>Link Google</DialogTitle>
		</Dialog>
	);
}

export default AccountLinkingModal;
