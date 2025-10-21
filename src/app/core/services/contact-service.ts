import { inject, Injectable, Injector, runInInjectionContext } from "@angular/core";
import { DocumentData } from "@angular/fire/compat/firestore";
import {
	collection,
	collectionData,
	deleteDoc,
	doc,
	Firestore,
	getDocs,
	setDoc,
} from "@angular/fire/firestore";
import { Contact } from "@core/interfaces/contact";
import { map, Observable, shareReplay } from "rxjs";

type ContactDictionary = Record<string, Contact[]>;

/**
 * Service for managing contacts, including CRUD operations, organization, and utility functions.
 *
 * This service handles:
 * - Real-time synchronization of contacts with Firestore
 * - Alphabetical organization of contacts
 * - Contact creation, update, and deletion
 * - Avatar color and initials generation
 *
 * @example
 * ```typescript
 * // Inject the service
 * private contactService = inject(ContactService);
 *
 * // Access organized contacts
 * const contacts = this.contactService.contactsObject;
 *
 * // Add a new contact
 * await this.contactService.addContact(newContact);
 * ```
 */
@Injectable({
	providedIn: "root",
})
export class ContactService {
	firestore = inject(Firestore);
	injector = inject(Injector);

	/** Observable stream of all contacts from Firestore with shared subscription */
	allContacts$!: Observable<Contact[]>;

	/** Observable stream of contacts organized alphabetically, derived from allContacts$ */
	contactsObject$!: Observable<ContactDictionary>;

	/**
	 * @deprecated Use contactsObject$ Observable instead
	 * Getter for backward compatibility - returns current snapshot
	 */
	get contactsObject(): ContactDictionary {
		let result: ContactDictionary = {};
		this.contactsObject$
			.pipe()
			.subscribe((val) => (result = val))
			.unsubscribe();
		return result;
	}

	constructor() {
		this.initializeObservables();
	}

	/**
	 * Initializes Observable streams for contacts.
	 * Sets up allContacts$ and derives contactsObject$ from it.
	 * @private
	 */
	private initializeObservables() {
		runInInjectionContext(this.injector, () => {
			const contactsCol = collection(this.firestore, "contacts");

			// Create shared Observable stream for all contacts
			this.allContacts$ = collectionData(contactsCol, { idField: "id" }).pipe(
				map((rawContacts: any[]) => {
					// Transform raw Firestore data to Contact objects
					return rawContacts.map((rawContact) => this.buildDocument(rawContact.id, rawContact));
				}),
				shareReplay(1), // Share one Firestore subscription among all subscribers
			);

			// Derive contactsObject$ from allContacts$
			this.contactsObject$ = this.allContacts$.pipe(
				map((contacts) => this.createLexObject(contacts)),
			);
		});
	}

	/**
	 * @deprecated Use allContacts$ Observable instead to avoid creating duplicate Firestore listeners.
	 * This method now returns the shared allContacts$ Observable.
	 *
	 * @returns Observable<Contact[]> - Stream of all contacts
	 *
	 * @example
	 * ```typescript
	 * // Old way (deprecated)
	 * this.contactService.getContactsAsObject().subscribe((contacts) => {
	 *   console.log("All contacts:", contacts);
	 * });
	 *
	 * // New way (recommended)
	 * this.contactService.allContacts$.subscribe((contacts) => {
	 *   console.log("All contacts:", contacts);
	 * });
	 * ```
	 */
	getContactsAsObject(): Observable<Contact[]> {
		return this.allContacts$;
	}

	/**
	 * Gets a contact by email address as Observable.
	 *
	 * @param email - Email address to search for
	 * @returns Observable stream of the contact with specified email (or undefined if not found)
	 */
	getContactByEmail(email: string): Observable<Contact | undefined> {
		return this.allContacts$.pipe(
			map((contacts) => contacts.find((contact) => contact.email === email)),
		);
	}

	/**
	 * Gets a contact by ID as Observable.
	 *
	 * @param contactId - Firestore document ID of the contact
	 * @returns Observable stream of the contact with specified ID (or undefined if not found)
	 *
	 * @example
	 * ```typescript
	 * this.contactService.getContactById("contact-id-123").subscribe((contact) => {
	 *   console.log("Contact:", contact);
	 * });
	 * ```
	 */
	getContactById(contactId: string): Observable<Contact | undefined> {
		return this.allContacts$.pipe(
			map((contacts) => contacts.find((contact) => contact.id === contactId)),
		);
	}

	/**
	 * @deprecated Use getContactById() Observable instead
	 * This method is kept for backward compatibility but should not be used in new code.
	 *
	 * @param contactId - Firestore document ID of the contact
	 */
	getDocumentById(contactId: string) {
		// For backward compatibility, we'll just subscribe and ignore
		// Components should migrate to using getContactById() Observable
		console.warn(
			"[ContactService] getDocumentById is deprecated. Use getContactById() Observable instead.",
		);
	}

	/**
	 * Creates a dictionary of contacts organized alphabetically by first letter.
	 *
	 * @param contactsArr - Array of contacts to organize
	 * @returns ContactDictionary organized by first letter of name
	 * @private
	 */
	private createLexObject(contactsArr: Contact[]): ContactDictionary {
		const contactsObject: ContactDictionary = {};

		contactsArr.forEach((obj) => {
			const firstLetter: string = obj.name.trim().charAt(0).toUpperCase();

			if (!firstLetter) return;

			if (!contactsObject[firstLetter]) {
				contactsObject[firstLetter] = [];
			}

			contactsObject[firstLetter].push(obj);
		});

		return contactsObject;
	}

	/**
	 * Builds a Contact object from Firestore document data.
	 *
	 * @param id - Firestore document ID
	 * @param data - Raw document data from Firestore
	 * @returns Contact object with proper typing and default values
	 *
	 * @example
	 * ```typescript
	 * const contactData = { name: "Alice", email: "alice@example.com" };
	 * const contact = this.buildDocument("contact-001", contactData);
	 * // contact: { id: "contact-001", name: "Alice", email: "alice@example.com", telephone: "", initials: "", color: undefined }
	 * ```
	 */
	private buildDocument(id: string, data: DocumentData): Contact {
		return {
			id,
			name: data["name"] || "",
			email: data["email"] || "",
			telephone: data["telephone"] || "",
			initials: data["initials"] || "",
			color: data["color"],
		};
	}

	/**
	 * Generates the next sequential contact ID in format: contact-001, contact-002, etc.
	 *
	 * @returns Promise that resolves to the next available contact ID
	 * @private
	 *
	 * @example
	 * ```typescript
	 * const nextId = await this.generateNextContactId(); // "contact-015"
	 * ```
	 */
	private async generateNextContactId(): Promise<string> {
		const contactsCol = collection(this.firestore, "contacts");
		const snapshot = await getDocs(contactsCol);
		let maxNum = 0;

		snapshot.forEach((docSnapshot) => {
			const match = docSnapshot.id.match(/^contact-(\d+)$/);
			if (match) {
				maxNum = Math.max(maxNum, parseInt(match[1]));
			}
		});

		return `contact-${String(maxNum + 1).padStart(3, "0")}`;
	}

	/**
	 * Adds a new contact to Firestore database with custom sequential ID.
	 *
	 * @param contact - Contact object to add to database
	 * @returns Promise that resolves to the new contact's ID (format: contact-001)
	 * @throws Error if contact creation fails
	 *
	 * @example
	 * ```typescript
	 * const newContact: Contact = {
	 *   name: 'John Doe',
	 *   email: 'john@example.com',
	 *   telephone: '+1234567890',
	 *   initials: 'JD',
	 *   color: 1
	 * };
	 * await this.contactService.addContact(newContact);
	 * ```
	 */
	async addContact(contact: Contact): Promise<string> {
		return await runInInjectionContext(this.injector, async () => {
			const contactsCol = collection(this.firestore, "contacts");

			try {
				const contactId = await this.generateNextContactId();

				await setDoc(doc(contactsCol, contactId), {
					name: contact.name,
					email: contact.email,
					telephone: contact.telephone,
					initials: contact.initials,
					color: contact.color,
				});

				return contactId;
			} catch (error) {
				console.error("[ContactService] Failed to add contact:", error);
				throw error;
			}
		});
	}

	/**
	 * Gets the CSS variable for contact avatar background color.
	 * Falls back to calculated color if none assigned.
	 *
	 * @param contact - Contact object with color property
	 * @returns CSS variable string for avatar background color
	 *
	 * @example
	 * ```typescript
	 * const bgColor = this.contactService.getAvatarColor(contact);
	 * // Returns: 'var(--avatar-color-3)'
	 * ```
	 */
	getAvatarColor(contact: Contact): string {
		if (contact.color) {
			return `var(--avatar-color-${contact.color})`;
		}

		const safeId = contact.id || contact.initials || "X";
		const fallbackIndex = (safeId.charCodeAt(0) % 10) + 1;

		return `var(--avatar-color-${fallbackIndex})`;
	}

	/**
	 * Deletes a contact from Firestore database.
	 *
	 * @param contactId - Firestore document ID of contact to delete
	 * @returns Promise that resolves when contact is deleted
	 * @throws Error if deletion fails or contactId is invalid
	 *
	 * @example
	 * ```typescript
	 * await this.contactService.deleteContact('contact-id-123');
	 * ```
	 */
	async deleteContact(contactId: string) {
		if (!contactId) return;

		const contactDoc = doc(this.firestore, "contacts", contactId);
		try {
			await deleteDoc(contactDoc);
		} catch {
			throw new Error("Failed to delete contact");
		}
	}

	/**
	 * Generates initials from a full name string.
	 * Takes the first letter of each word and converts to uppercase.
	 *
	 * @param name - Full name string (e.g., 'John Doe')
	 * @returns Initials string (e.g., 'JD')
	 *
	 * @example
	 * ```typescript
	 * const initials = this.contactService.generateInitials('John Doe');
	 * // Returns: 'JD'
	 * ```
	 */
	generateInitials(name: string): string {
		return name
			.split(" ")
			.map((n) => n.charAt(0).toUpperCase())
			.join("");
	}
}
