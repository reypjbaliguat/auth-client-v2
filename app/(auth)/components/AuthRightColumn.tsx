import Image from 'next/image';

function AuthRightColumn() {
	return (
		<div className={`hidden sm:grid col-span-2 h-full`}>
			<div className="w-full relative">
				<Image
					src={'/assets/login-bg.jpg'}
					alt="forest"
					className="absolute inset-0 w-full h-full object-cover"
				/>
			</div>
		</div>
	);
}

export default AuthRightColumn;
