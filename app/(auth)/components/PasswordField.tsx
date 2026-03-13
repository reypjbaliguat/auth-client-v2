'use client';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useState } from 'react';
import { ControllerRenderProps, FieldError } from 'react-hook-form';

interface Props {
	field: ControllerRenderProps<
		{
			email: string;
			password: string;
		},
		'password'
	>;
	error: FieldError | undefined;
	label: 'Password' | 'Confirm Password';
}

function PasswordField({ field, error, label }: Props) {
	const [showPassword, setShowPassword] = useState(false);

	const handleClickShowPassword = () => setShowPassword((show) => !show);

	return (
		<TextField
			{...field}
			className="mb-4"
			value={field.value || ''}
			type={showPassword ? 'text' : 'password'}
			fullWidth
			helperText={error ? error.message : ''}
			error={!!error}
			label={label}
			InputProps={{
				endAdornment: (
					<InputAdornment position="end">
						<IconButton onClick={handleClickShowPassword} edge="end" className="dark:text-white">
							{showPassword ? <VisibilityOff /> : <Visibility />}
						</IconButton>
					</InputAdornment>
				),
			}}
		/>
	);
}

export default PasswordField;
