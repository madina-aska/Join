import { KeyValuePipe } from "@angular/common";
import { Component, EventEmitter, inject, input, Output, output } from "@angular/core";
import { Router } from "@angular/router";
import { ContactService } from "@core/services/contact-service";
import { Button } from "@shared/components/button/button";

/**
 * Component for displaying a list of contacts organized alphabetically.
 *
 * This component serves as the main contact list interface with features including:
 * - Alphabetical contact organization (A-Z sections)
 * - Real-time contact data from ContactService
 * - Contact selection and navigation
 * - Add contact button integration
 * - Responsive list display with avatar colors
 *
 * Data Structure:
 * - Contacts are automatically organized by first letter of name
 * - Each letter section contains an array of contacts
 * - Real-time updates via Firestore subscriptions
 *
 * Navigation:
 * - Contact selection navigates to detailed contact view
 * - Add contact button triggers parent component's add overlay
 *
 * @example
 * ```html
 * <app-contact-list
 *   (addContactClicked)="onAddContactClicked()"
 *   (contactSelected)="onContactSelected($event)">
 * </app-contact-list>
 * ```
 */
@Component({
	selector: "app-contact-list",
	imports: [KeyValuePipe, Button],
	templateUrl: "./contact-list.html",
	styleUrl: "./contact-list.scss",
})
export class ContactList {
	/** Injected contact service for accessing organized contact data */
	contactService = inject(ContactService);

	/** Injected router for contact navigation */
	router = inject(Router);
	activeId = input<string>();

	/** Emitted when the add contact button is clicked */
	@Output() addContactClicked = new EventEmitter<void>();

	/** Modern Angular output for contact selection events */
	contactSelected = output<string>();

	/**
	 * Opens the add contact interface by emitting the addContactClicked event.
	 * Called when user taps the add contact button in the list.
	 *
	 * @example
	 * ```typescript
	 * this.openAddContact(); // Emits event to parent component
	 * // Parent component typically opens add contact overlay
	 * ```
	 */
	openAddContact() {
		this.addContactClicked.emit();
	}

	/**
	 * Handles contact selection and navigation to detailed view.
	 * Navigates to the contact detail route with the selected contact ID.
	 *
	 * @param id - Firestore document ID of the selected contact
	 *
	 * @example
	 * ```typescript
	 * this.onContactSelect('contact-id-123');
	 * // Navigates to: /contacts/contact-id-123
	 * ```
	 */
	onContactSelect(id: string | undefined) {
		if (!id) return;
		this.router.navigate(["/contacts", id]);
	}
}
