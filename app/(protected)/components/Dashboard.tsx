const Container = ({ children }: { children: React.ReactNode }) => (
	<div className="flex h-screen w-screen"> {children} </div>
);

const Sidebar = () => (
	<div className="w-64 bg-gray-800 text-white">
		<h1>Sidebar</h1>
	</div>
);

export const Dashboard = {
	Container: Container,
	Sidebar: Sidebar,
};
