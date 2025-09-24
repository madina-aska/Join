import { KeyValuePipe } from "@angular/common";
import { Component, EventEmitter, inject, input, Output, output } from "@angular/core";
import { Router } from "@angular/router";
import { Button } from "@shared/components/button/button";
import { ContactService } from "app/core/services/contact-service";

@Component({
	selector: "app-contact-list",
	imports: [KeyValuePipe, Button],
	templateUrl: "./contact-list.html",
	styleUrl: "./contact-list.scss",
})
export class ContactList {
	contactService = inject(ContactService);
	router = inject(Router);
	activeId = input<string>();

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
