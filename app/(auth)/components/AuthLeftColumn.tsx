import React from 'react';

interface Props {
	children: React.ReactNode;
}
function AuthLeftColumn({ children }: Props) {
	return (
		<div className="grid col-span-full sm:col-span-3 h-full items-center justify-center">
			{children}
		</div>
	);
}

export default AuthLeftColumn;
