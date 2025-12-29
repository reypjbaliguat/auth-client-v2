export interface User {
	_id: string;
	name?: string;
	email: string;
	isActive: boolean;
	emailVerified: boolean;
	avatarUrl?: string;
	createdAt: string;
}
