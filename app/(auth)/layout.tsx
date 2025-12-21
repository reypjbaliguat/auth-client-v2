import React from 'react';

function Layout({ children }: { children: React.ReactNode }) {
	return <div className="flex h-screen w-screen items-center justify-center">{children}</div>;
}

export default Layout;
