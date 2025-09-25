import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AddContact } from "./add-contact/add-contact";
import { ContactList } from "./contact-list/contact-list";
import { ContactView } from "./contact-view/contact-view";

@Component({
	selector: "app-contacts",
	imports: [ContactList, ContactView, AddContact, CommonModule],
	templateUrl: "./contacts.html",
	styleUrl: "./contacts.scss",
})
export class Contacts {
	route = inject(ActivatedRoute);
	router = inject(Router);
	id = this.route.snapshot.paramMap.get("id") || "";
	showList = true;

	isAddContactOpen = false;

	onAddContactClicked() {
		this.isAddContactOpen = true;
	}

	onAddContactClosed() {
		this.isAddContactOpen = false;
	}

	onContactCreated(id: string) {
		if (!id) return;
		this.router.navigate(["/contacts", id]);
	}

	constructor() {
		this.route.params.subscribe((params) => {
			if (!params["id"]) {
				this.showList = true;
			} else {
				this.showList = false;
			}

			this.id = params["id"];
		});
	}
}
