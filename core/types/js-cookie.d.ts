declare module 'js-cookie' {
	interface CookieAttributes {
		sameSite?: 'strict' | 'lax' | 'none';
		secure?: boolean;
		httpOnly?: boolean;
		domain?: string;
		path?: string;
		expires?: number | Date;
	}

	namespace Cookies {
		function get(name: string): string | undefined;
		function set(
			name: string,
			value: string | object,
			options?: CookieAttributes
		): string | undefined;
		function remove(name: string, options?: CookieAttributes): void;
		function getJSON(name: string): unknown;
		function setJSON(name: string, value: unknown, options?: CookieAttributes): string | undefined;
	}

	export = Cookies;
}
