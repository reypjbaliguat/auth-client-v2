export function Loader() {
	return (
		<div className="h-screen bg-black flex items-center justify-center">
			<div className="w-2/3 max-w-md">
				<div className="h-1 w-full bg-white/20 overflow-hidden rounded">
					<div className="h-full w-1/3 bg-white animate-[loading_1.5s_infinite]" />
				</div>
			</div>

			<style jsx>{`
				@keyframes loading {
					0% {
						transform: translateX(-100%);
					}
					100% {
						transform: translateX(300%);
					}
				}
			`}</style>
		</div>
	);
}
