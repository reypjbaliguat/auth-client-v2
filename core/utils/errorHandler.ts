/**
 * Error handling utilities for API responses and general errors
 */

// Type definitions for common error structures
export interface ApiError {
	status?: number;
	data?: {
		message?: string;
		error?: string;
		details?: string;
	};
}

export interface RTKError {
	status?: number;
	data?: {
		message?: string;
		error?: string;
	};
}

/**
 * Extracts a user-friendly error message from various error types
 * @param error - The error object (can be from RTK Query, fetch, or general Error)
 * @param fallbackMessage - Default message if no specific message found
 * @returns A user-friendly error message
 */
export const extractErrorMessage = (
	error: unknown,
	fallbackMessage: string = 'An unexpected error occurred'
): string => {
	// Handle null/undefined
	if (!error) {
		return fallbackMessage;
	}

	// Handle RTK Query errors
	if (typeof error === 'object' && 'data' in error) {
		const rtkError = error as RTKError;

		if (rtkError.data?.message) {
			return rtkError.data.message;
		}

		if (rtkError.data?.error) {
			return rtkError.data.error;
		}
	}

	// Handle standard Error objects
	if (error instanceof Error) {
		return error.message || fallbackMessage;
	}

	// Handle string errors
	if (typeof error === 'string') {
		return error;
	}

	// Handle objects with message property
	if (
		typeof error === 'object' &&
		'message' in error &&
		typeof (error as { message: unknown }).message === 'string'
	) {
		return (error as { message: string }).message;
	}

	// Fallback
	return fallbackMessage;
};

/**
 * Handles async operations with proper error extraction
 * @param operation - The async operation to execute
 * @param fallbackMessage - Default error message
 * @returns Object with success status, data, and error message
 */
export const handleAsyncOperation = async <T>(
	operation: () => Promise<T>,
	fallbackMessage?: string
): Promise<{ success: boolean; data?: T; error?: string }> => {
	try {
		const data = await operation();
		return { success: true, data };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, fallbackMessage),
		};
	}
};

/**
 * Type guard to check if error is an RTK Query error
 */
export const isRTKError = (error: unknown): error is RTKError => {
	return (
		typeof error === 'object' &&
		error !== null &&
		'data' in error &&
		typeof (error as RTKError).data === 'object'
	);
};

/**
 * Specific error handler for authentication-related operations
 */
export class AuthErrorHandler {
	static extractMessage(error: unknown): string {
		// Handle authentication-specific errors
		if (isRTKError(error)) {
			const { data } = error;

			// Check for specific auth error messages
			if (data?.message?.includes('invalid credentials')) {
				return 'Invalid email or password. Please try again.';
			}

			if (data?.message?.includes('rate limit')) {
				return 'Too many attempts. Please wait before trying again.';
			}

			if (data?.message?.includes('invalid otp') || data?.message?.includes('expired')) {
				return 'Invalid or expired OTP. Please try again.';
			}
		}

		return extractErrorMessage(error, 'Authentication failed. Please try again.');
	}
}
