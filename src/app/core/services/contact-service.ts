import { inject, Injectable, OnDestroy } from "@angular/core";
import { DocumentData } from "@angular/fire/compat/firestore";
import {
	collection,
	collectionData,
	doc,
	Firestore,
	onSnapshot,
	QuerySnapshot,
} from "@angular/fire/firestore";
import { Contact } from "../interfaces/contact";

type ContactDictionary = Record<string, Contact[]>;

@Injectable({
	providedIn: "root",
})
export class ContactService implements OnDestroy {
	firestore = inject(Firestore);

	contactForView: Contact | undefined;
	contactsObject: ContactDictionary = {};
	unsubscribeContactsObject: (() => void) | null = null;
	unsubscribeContactForView: (() => void) | null = null;

	constructor() {
		this.getContactsAsObject();
	}

	getContactsAsObject() {
		const contactsCol = collection(this.firestore, "contacts");

		this.unsubscribeContactsObject = onSnapshot(
			contactsCol,
			(snapshot: QuerySnapshot<DocumentData>) => {
				this.contactsObject = {};

				const contacts: Contact[] = [];

				snapshot.forEach((doc) => {
					contacts.push(this.buildDocument(doc.id, doc.data()));
				});
				console.log(contacts);
				this.createLexObject(contacts);
				console.log(this.contactsObject);
			},
		);

		return collectionData(contactsCol, { idField: "id" });
	}

	getDocumentById(contactId: string) {
		const contact = doc(this.firestore, "contacts", contactId);
		this.unsubscribeContactForView = onSnapshot(contact, (snapshot) => {
			if (snapshot.exists()) {
				this.contactForView = this.buildDocument(snapshot.id, snapshot.data());
			} else {
				this.contactForView = undefined;
			}
		});
	}

	private createLexObject(contactsArr: Contact[]) {
		this.contactsObject = {};
		contactsArr.forEach((obj) => {
			const firstLetter: string = obj.name.trim().charAt(0);

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
			color: data["color"] || 1,
		};
	}

	ngOnDestroy() {
		this.unsubscribeContactForView?.();
		this.unsubscribeContactsObject?.();
	}
}
