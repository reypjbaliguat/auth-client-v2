import { Dashboard } from './components/Dashboard';

function Layout({ children }: { children: React.ReactNode }) {
	return (
		<Dashboard.Container>
			<Dashboard.Sidebar />
			{children}
		</Dashboard.Container>
	);
}

export default Layout;
