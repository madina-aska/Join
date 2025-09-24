import { inject, Injectable, Injector, OnDestroy, runInInjectionContext } from "@angular/core";
import { DocumentData } from "@angular/fire/compat/firestore";
import {
	addDoc,
	collection,
	collectionData,
	doc,
	Firestore,
	onSnapshot,
	QuerySnapshot,
	deleteDoc,
} from "@angular/fire/firestore";
import { Contact } from "../interfaces/contact";

type ContactDictionary = Record<string, Contact[]>;

@Injectable({
	providedIn: "root",
})
export class ContactService implements OnDestroy {
	firestore = inject(Firestore);
	injector = inject(Injector);

	contactForView: Contact | undefined;
	contactsObject: ContactDictionary = {};
	unsubscribeContactsObject: (() => void) | null = null;
	unsubscribeContactForView: (() => void) | null = null;

	constructor() {
		this.getContactsAsObject();
	}

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

	getDocumentById(contactId: string) {
		runInInjectionContext(this.injector, () => {
			const contact = doc(this.firestore, "contacts", contactId);
			this.unsubscribeContactForView = onSnapshot(contact, (snapshot) => {
				if (snapshot.exists()) {
					this.contactForView = this.buildDocument(snapshot.id, snapshot.data());
				} else {
					this.contactForView = undefined;
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

	async addContact(contact: Contact): Promise<void> {
		const contactsCol = collection(this.firestore, "contacts");

		try {
			await addDoc(contactsCol, {
				name: contact.name,
				email: contact.email,
				telephone: contact.telephone,
				initials: contact.initials,
				color: contact.color,
			});
			console.log("Contact saved:", contact.name); //delete later
		} catch (error) {
			console.error("Save contact error:", error); //delete later
			throw error;
		}
	}

	getAvatarColor(contact: Contact): string {
		if (contact.color) {
			return `var(--avatar-color-${contact.color})`;
		}

		const safeId = contact.id || contact.initials || "X";
		const fallbackIndex = (safeId.charCodeAt(0) % 10) + 1;

		return `var(--avatar-color-${fallbackIndex})`;
	}

	async deleteContact(contactId: string) {
		if (!contactId) return;

		const contactDoc = doc(this.firestore, "contacts", contactId);
		try {
			await deleteDoc(contactDoc);
		} catch {
			throw new Error("Failed to delete contact");
		}
	}

	generateInitials(name: string): string {
		return name
			.split(" ")
			.map((n) => n.charAt(0).toUpperCase())
			.join("");
	}
}
