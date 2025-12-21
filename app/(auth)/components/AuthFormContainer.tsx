import { Card } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
	label: 'Login' | 'Register' | 'OTP Verification';
	children: React.ReactNode;
}

function AuthFormContainer({ label, children }: Props) {
	const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
	const isLogin = label === 'Login';
	const isOtp = label === 'OTP Verification';
	return (
		<GoogleOAuthProvider clientId={googleClientId || ''}>
			<Card className="md:p-10 px-5 py-7 flex justify-center flex-col w-[300px] md:w-[500px]">
				<Image src={'/assets/logo.png'} width={50} height={50} className="mb-5" alt="logo" />
				<h6 className="text-3xl mb-5"> {label} </h6>
				{isLogin && <span className="text-lg">Please enter your login info</span>}
				{children}
				{isLogin ? (
					<Link href={`/sign-up`} className="mx-auto mt-5 text-blue-500">
						Do you need an account?
					</Link>
				) : isOtp ? (
					<></>
				) : (
					<Link href={`/sign-in`} className="mx-auto mt-5 text-blue-500">
						Already have an account?
					</Link>
				)}
			</Card>
		</GoogleOAuthProvider>
	);
}

export default AuthFormContainer;
