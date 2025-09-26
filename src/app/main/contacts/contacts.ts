import { CommonModule, ViewportScroller } from "@angular/common";
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
	vps = inject(ViewportScroller);
	route = inject(ActivatedRoute);
	router = inject(Router);
	id = this.route.snapshot.queryParams["id"] || "";
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
		this.router.navigate(["/contacts"], {
			queryParams: { id },
		});
		this.vps.scrollToAnchor(id, { behavior: "smooth" });
	}

	constructor() {
		this.route.queryParams.subscribe((params) => {
			if (params["id"]) {
				this.showList = false;
			} else {
				this.showList = true;
			}
			this.id = params["id"];
		});
	}
}
