import { Alert } from '@mui/material';

function CustomError({ customError }: { customError: string }) {
	return (
		<div className={`basis-full mb-4 ${!customError && 'hidden'}`}>
			<Alert severity="error">{customError}</Alert>
		</div>
	);
}

export default CustomError;
