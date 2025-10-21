import { CommonModule, ViewportScroller } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AddContact } from "@main/contacts/add-contact/add-contact";
import { ContactList } from "@main/contacts/contact-list/contact-list";
import { ContactView } from "@main/contacts/contact-view/contact-view";

/**
 * Contacts component manages the main contacts page.
 *
 * Responsibilities:
 * - Displays the contact list or a single contact view based on query parameters.
 * - Opens the AddContact form when requested.
 * - Scrolls to a newly created contact after it is added.
 */
@Component({
	selector: "app-contacts",
	imports: [ContactList, ContactView, AddContact, CommonModule],
	templateUrl: "./contacts.html",
	styleUrl: "./contacts.scss",
})
export class Contacts {
	/**
	 * ViewportScroller service used to scroll to specific anchors in the page.
	 */
	vps = inject(ViewportScroller);

	/**
	 * ActivatedRoute service to read query parameters.
	 */
	route = inject(ActivatedRoute);

	/**
	 * Router service to navigate programmatically.
	 */
	router = inject(Router);

	/**
	 * ID of the currently selected contact, read from query parameters.
	 * Empty string if no contact is selected.
	 */
	id = this.route.snapshot.queryParams["id"] || "";

	/**
	 * Whether the contact list should be displayed.
	 * False when a single contact is being viewed.
	 */
	showList = true;

	/**
	 * Tracks if the "Add Contact" form/modal is open.
	 */
	isAddContactOpen = false;

	/**
	 * Opens the AddContact form.
	 */
	onAddContactClicked() {
		this.isAddContactOpen = true;
	}

	/**
	 * Closes the AddContact form.
	 */
	onAddContactClosed() {
		this.isAddContactOpen = false;
	}

	/**
	 * Called when a new contact is created.
	 * Navigates to the newly created contact and scrolls to it smoothly.
	 *
	 * @param {string} id - ID of the newly created contact.
	 */
	onContactCreated(id: string) {
		if (!id) return;
		this.router.navigate(["/contacts"], {
			queryParams: { id },
		});
		this.vps.scrollToAnchor(id, { behavior: "smooth" });
	}

	/**
	 * Subscribes to route query parameters to toggle between
	 * showing the contact list and viewing a single contact.
	 */
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
