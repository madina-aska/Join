import { inject, Injectable, Injector, OnDestroy, runInInjectionContext } from "@angular/core";
import { DocumentData } from "@angular/fire/compat/firestore";
import {
	addDoc,
	collection,
	collectionData,
	deleteDoc,
	doc,
	Firestore,
	onSnapshot,
	QuerySnapshot,
} from "@angular/fire/firestore";
import { Contact } from "@core/interfaces/contact";

type ContactDictionary = Record<string, Contact[]>;

/**
 * Service for managing contact operations including Firestore CRUD operations,
 * contact organization, and utility functions for contact display.
 *
 * This service handles:
 * - Real-time contact synchronization with Firestore
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
export class ContactService implements OnDestroy {
	firestore = inject(Firestore);
	injector = inject(Injector);

	/** Currently selected contact for detailed view */
	contactForView: Contact | undefined;

	/** Dictionary of contacts organized alphabetically by first letter of name */
	contactsObject: ContactDictionary = {};

	/** Cleanup function for contacts collection subscription */
	unsubscribeContactsObject: (() => void) | null = null;

	/** Cleanup function for single contact subscription */
	unsubscribeContactForView: (() => void) | null = null;

	constructor() {
		this.getContactsAsObject();
	}

	/**
	 * Establishes real-time subscription to all contacts in Firestore.
	 * Automatically organizes contacts alphabetically and updates contactsObject.
	 *
	 * @returns Observable data stream from Firestore collection
	 *
	 * @example
	 * ```typescript
	 * // Called automatically in constructor
	 * // Access organized contacts via this.contactsObject
	 * ```
	 */
	getContactsAsObject() {
		let data;
		runInInjectionContext(this.injector, () => {
			const contactsCol = collection(this.firestore, "contacts");

			this.unsubscribeContactsObject = onSnapshot(
				contactsCol,
				(snapshot: QuerySnapshot<DocumentData>) => {
					this.contactsObject = {};

					const contacts: Contact[] = [];

					snapshot.forEach((doc) => {
						contacts.push(this.buildDocument(doc.id, doc.data()));
					});
					this.createLexObject(contacts);
				},
			);
			data = collectionData(contactsCol, { idField: "id" });
		});
		return data;
	}

	/**
	 * Subscribes to a specific contact document by ID for real-time updates.
	 * Updates contactForView property with the latest contact data.
	 *
	 * @param contactId - Firestore document ID of the contact
	 *
	 * @example
	 * ```typescript
	 * this.contactService.getDocumentById('contact-id-123');
	 * // Access contact via this.contactService.contactForView
	 * ```
	 */
	getDocumentById(contactId: string) {
		runInInjectionContext(this.injector, () => {
			const contact = doc(this.firestore, "contacts", contactId);
			this.unsubscribeContactForView = onSnapshot(contact, (snapshot) => {
				this.contactForView = undefined;
				if (snapshot.exists()) {
					setTimeout(() => {
						this.contactForView = this.buildDocument(snapshot.id, snapshot.data());
					}, 0);
				}
			});
		});
	}

	private createLexObject(contactsArr: Contact[]) {
		this.contactsObject = {};
		contactsArr.forEach((obj) => {
			const firstLetter: string = obj.name.trim().charAt(0).toUpperCase();

			if (!firstLetter) return;

			if (!this.contactsObject[firstLetter]) {
				this.contactsObject[firstLetter] = [];
			}

			this.contactsObject[firstLetter].push(obj);
		});
	}

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

	ngOnDestroy() {
		this.unsubscribeContactForView?.();
		this.unsubscribeContactsObject?.();
	}

	/**
	 * Adds a new contact to Firestore database.
	 *
	 * @param contact - Contact object to add to database
	 * @returns Promise that resolves when contact is successfully added
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
				const docRef = await addDoc(contactsCol, {
					name: contact.name,
					email: contact.email,
					telephone: contact.telephone,
					initials: contact.initials,
					color: contact.color,
				});
				return docRef.id;
			} catch (error) {
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
