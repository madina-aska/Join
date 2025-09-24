import { Component, inject, input, OnChanges, signal } from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import { ActivatedRoute, Router } from "@angular/router";
import { ContactMenu } from "@shared/components/contact-menu/contact-menu";
import { ContactService } from "app/core/services/contact-service";
import { EditContact } from "../edit-contact/edit-contact";

@Component({
	imports: [ContactMenu, EditContact],
	selector: "app-contact-view",
	templateUrl: "./contact-view.html",
	styleUrls: ["./contact-view.scss"],
	standalone: true,
})
export class ContactView implements OnChanges {
	firestore = inject(Firestore);
	contactService = inject(ContactService);
	route = inject(ActivatedRoute);
	router = inject(Router);
	id = input<string>("");
	isEditOverlayOpen = signal(false);
	onEditContactId = signal("");

	ngOnChanges() {
		if (this.id()) {
			this.contactService.getDocumentById(this.id());
		} else {
			this.contactService.contactForView = undefined;
		}
	}

	goBack() {
		this.router.navigate(["/contacts"]);
	}

	// Öffnet das Overlay und setzt die ID
	onEditContact(contactId: string): void {
		this.onEditContactId.set(contactId);
		this.isEditOverlayOpen.set(true);
	}

	async onDeleteContact(contactId: string) {
		if (!contactId) return;

		try {
			await this.contactService.deleteContact(contactId);
			this.goBack();
		} catch {
			alert("Failed to delete contact. Please try again.");
		}
	}

	onCloseEditOverlay() {
		this.isEditOverlayOpen.set(false);
	}
}
