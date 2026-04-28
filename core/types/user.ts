export interface User {
	_id: string;
	name?: string;
	email: string;
	isActive: boolean;
	emailVerified: boolean;
	avatarUrl?: string;
	createdAt: string;
}

export interface PasswordLinking {
	show: boolean;
	credential: string | null;
	email: string | null;
}
