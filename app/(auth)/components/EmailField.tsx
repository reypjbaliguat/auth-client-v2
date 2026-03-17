import { TextField } from '@mui/material';
import { ControllerRenderProps, FieldError, Path } from 'react-hook-form';

interface Props<T extends Record<string, unknown> & { email: string }> {
	field: ControllerRenderProps<T, Path<T>>;
	error: FieldError | undefined;
}

function EmailField<T extends Record<string, unknown> & { email: string }>({
	field,
	error,
}: Props<T>) {
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
