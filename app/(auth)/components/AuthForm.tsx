'use client';

import { ChildrenProps } from '@/core/types/children';
import { Alert, Box, Card } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Image from 'next/image';
import { FormEventHandler } from 'react';

type SubmitType = FormEventHandler<HTMLFormElement> | undefined;

// Root component
export default function AuthForm({ children }: ChildrenProps) {
	return (
		<Card className="md:p-10 px-5 py-7 flex justify-center flex-col w-[300px] md:w-[500px]">
			{children}
		</Card>
	);
}

const GoogleProvider = ({ children }: ChildrenProps) => {
	const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
	return <GoogleOAuthProvider clientId={googleClientId || ''}>{children}</GoogleOAuthProvider>;
};

const AuthFormImage = () => {
	return <Image src={'/assets/logo.png'} width={50} height={50} className="mb-5" alt="logo" />;
};

const AuthFormHeader = ({ header }: { header: string }) => {
	return <h6 className="text-3xl mb-5"> {header} </h6>;
};

const AuthFormLabel = ({ label }: { label: string }) => {
	return <span className="text-lg"> {label} </span>;
};

const AuthFooter = ({ children }: ChildrenProps) => {
	return <div className="flex flex-col">{children}</div>;
};

const Form = ({
	children,
	handleSubmit,
}: {
	children: React.ReactNode;
	handleSubmit: SubmitType;
}) => {
	return (
		<Box component="form" onSubmit={handleSubmit}>
			{children}
		</Box>
	);
};

const FormFieldContainer = ({ children }: ChildrenProps) => {
	return <div className="flex flex-col gap-y-2 my-4">{children}</div>;
};

const ErrorMessage = ({ customError }: { customError: string }) => {
	return (
		<div className="basis-full mb-4">
			<Alert severity="error">{customError}</Alert>
		</div>
	);
};

const SuccessMessage = ({ customSuccess }: { customSuccess: string }) => {
	return (
		<div className="basis-full mb-4">
			<Alert severity="success">{customSuccess}</Alert>
		</div>
	);
};

AuthForm.GoogleProvider = GoogleProvider;
AuthForm.AuthFormHeader = AuthFormHeader;
AuthForm.AuthFormLabel = AuthFormLabel;
AuthForm.AuthFormImage = AuthFormImage;
AuthForm.AuthFooter = AuthFooter;
AuthForm.Form = Form;
AuthForm.FormFieldContainer = FormFieldContainer;
AuthForm.ErrorMessage = ErrorMessage;
AuthForm.SuccessMessage = SuccessMessage;
