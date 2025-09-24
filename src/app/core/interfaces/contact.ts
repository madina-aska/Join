/**
 * Represents a contact entity in the contact management system.
 * Used for storing and managing contact information throughout the application.
 *
 * @interface Contact
 *
 * @example
 * ```typescript
 * const newContact: Contact = {
 *   name: 'John Doe',
 *   email: 'john.doe@example.com',
 *   telephone: '+1-555-123-4567',
 *   initials: 'JD',
 *   color: 3
 * };
 * ```
 */
export interface Contact {
	/** Unique identifier from Firestore document (auto-generated) */
	id?: string;

	/** Full name of the contact (first and last name required) */
	name: string;

	/** Email address for contact communication */
	email: string;

	/** Phone number in international format */
	telephone: string;

	/** Avatar background color identifier (1-10 for CSS variables) */
	color?: number;

	/** Generated initials from the contact's name (e.g., "JD" for John Doe) */
	initials?: string;
}
