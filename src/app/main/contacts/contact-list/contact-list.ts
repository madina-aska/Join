import { KeyValuePipe } from "@angular/common";
import { Component, EventEmitter, inject, Output, output } from "@angular/core";
import { Router } from "@angular/router";
import { ContactService } from "app/core/services/contact-service";

@Component({
	selector: "app-contact-list",
	imports: [KeyValuePipe],
	templateUrl: "./contact-list.html",
	styleUrl: "./contact-list.scss",
})
export class ContactList {
	contactService = inject(ContactService);
	router = inject(Router);

	@Output() addContactClicked = new EventEmitter<void>();

	openAddContact() {
		this.addContactClicked.emit();
	}

	contactSelected = output<string>();

	onContactSelect(id: string | undefined) {
		if (!id) return;
		this.router.navigate(["/contacts", id]);
	}
}
