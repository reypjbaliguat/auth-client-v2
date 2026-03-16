import { TextField } from '@mui/material';
import { ControllerRenderProps, FieldError } from 'react-hook-form';

interface Props {
	field: ControllerRenderProps<
		{
			email: string;
			password: string;
		},
		'email'
	>;
	error: FieldError | undefined;
}

function EmailField({ field, error }: Props) {
	return (
		<TextField
			{...field}
			label="Email"
			variant="outlined"
			value={field.value || ''}
			error={!!error}
			helperText={error ? error.message : null}
			fullWidth
		/>
	);
}

export default EmailField;
