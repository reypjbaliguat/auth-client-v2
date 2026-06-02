'use client';

import { resetOtpStep, setUnauthenticated } from '@/core/store/features';
import { useAppDispatch } from '@/core/store/hooks';
import { Button } from '@mui/material';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
	{ href: '/dashboard', label: 'Dashboard' },
	{ href: '/settings', label: 'Settings' },
];

const Container = ({ children }: { children: React.ReactNode }) => (
	<div className="flex h-screen w-screen"> {children} </div>
);

const SidebarLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
	const pathname = usePathname();
	const isActive = pathname === href;
	return (
		<Link
			href={href}
			className={`group relative overflow-hidden rounded-md px-4 py-2 text-lg font-medium transition-all duration-300 ease-out motion-safe:hover:-translate-y-0.5 ${
				isActive
					? 'bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)]'
					: 'text-gray-300 hover:bg-white/5 hover:text-white'
			}`}
		>
			<span className="relative z-10">{children}</span>
			<span
				aria-hidden="true"
				className={`pointer-events-none absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-cyan-300 transition-all duration-300 ease-out ${
					isActive ? 'w-4/5 opacity-100' : 'w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-100'
				}`}
			/>
		</Link>
	);
};

const LogoutButton = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();

	const handleLogout = () => {
		// Clear authentication cookies
		Cookies.remove('token', { path: '/' });
		Cookies.remove('refreshToken', { path: '/' });

		// Clear Redux auth state
		dispatch(setUnauthenticated());

		// Reset OTP step for fresh login flow
		dispatch(resetOtpStep());

		// Redirect to login page
		router.push('/sign-in');
	};
	return (
		<Button
			variant="contained"
			onClick={handleLogout}
			className="group relative mx-6 mb-1 overflow-hidden rounded-lg border border-red-300/30 bg-linear-to-r from-rose-500 to-red-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-red-900/30 transition-all duration-300 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl motion-safe:hover:shadow-red-900/40 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]"
			sx={{ textTransform: 'none' }}
		>
			<span className="relative z-10">Logout</span>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
			/>
		</Button>
	);
};

const Sidebar = () => (
	<div className="w-64 bg-gray-800 text-white flex flex-col justify-between h-screen py-10 px-10">
		<div className="flex flex-col items-center  gap-y-5">
			<Image src="/assets/logo.png" alt="Logo" width={80} height={80} />
			{links.map((link) => (
				<SidebarLink key={link.href} href={link.href}>
					{link.label}
				</SidebarLink>
			))}
		</div>
		<LogoutButton />
	</div>
);

export const Dashboard = {
	Container: Container,
	Sidebar: Sidebar,
};
