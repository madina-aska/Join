import { Component, inject, input, OnChanges, OnDestroy, signal } from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Contact } from "@core/interfaces/contact";
import { ContactService } from "@core/services/contact-service";
import { EditContact } from "@main/contacts/edit-contact/edit-contact";
import { Button } from "@shared/components/button/button";
import { ContactMenu } from "@shared/components/contact-menu/contact-menu";
import { ToastAction } from "@shared/components/toast/toast";
import { ToastService } from "@shared/services/toast.service";

/**
 * Component for displaying detailed contact information and managing contact operations.
 *
 * This component provides a complete contact view interface with the following features:
 * - Real-time contact data display from Firestore
 * - Two-step delete confirmation process for safety
 * - Edit contact overlay integration
 * - Navigation controls (back to contact list)
 * - Toast notifications for user feedback
 * - Responsive contact menu for actions
 *
 * Key Features:
 * - **Two-Step Delete Process**: First tap shows confirmation toast with action button
 * - **Edit Integration**: Seamless overlay for contact editing
 * - **Real-time Updates**: Automatic synchronization with Firestore changes
 * - **Safe Navigation**: Proper cleanup and state management
 *
 * Delete Flow:
 * 1. User taps delete button
 * 2. Warning toast appears with "Delete" action button
 * 3. User must click "Delete" in toast to confirm
 * 4. Contact is deleted and user is navigated back
 * 5. Auto-timeout resets confirmation after 5 seconds
 *
 * @example
 * ```html
 * <!-- Used in routing with contact ID parameter -->
 * <app-contact-view [id]="contactId"></app-contact-view>
 * ```
 */
@Component({
	imports: [Button, ContactMenu, EditContact],
	selector: "app-contact-view",
	templateUrl: "./contact-view.html",
	styleUrls: ["./contact-view.scss"],
	standalone: true,
})
export class ContactView implements OnChanges, OnDestroy {
	/** Injected Firestore service for database operations */
	firestore = inject(Firestore);

	/** Injected contact service for contact management operations */
	contactService = inject(ContactService);

	router = inject(Router);

	/** Injected toast service for user notifications */
	toastService = inject(ToastService);

	/** Input signal containing the contact ID to display */
	id = input<string>("");

	/** Signal containing the current contact being viewed */
	contactForView = signal<Contact | undefined>(undefined);

	/** Signal controlling the visibility of the edit contact overlay */
	isEditOverlayOpen = signal(false);

	/** Signal containing the ID of the contact currently being edited */
	onEditContactId = signal("");

	/** Stores the contact ID pending delete confirmation for two-step delete process */
	private deleteConfirmationContactId: string | null = null;

	/** Timeout handle for auto-reset of delete confirmation after 5 seconds */
	private deleteConfirmationTimeout?: number;

	/** Subscription to the contact Observable for cleanup */
	private contactSubscription?: Subscription;

	/**
	 * Angular lifecycle hook that responds to changes in input properties.
	 * Loads contact data when ID changes or clears data when ID is removed.
	 *
	 * @example
	 * ```typescript
	 * // Called automatically when [id] input changes
	 * // Loads contact data from Firestore if ID provided
	 * ```
	 */
	ngOnChanges() {
		// Clean up previous subscription
		this.contactSubscription?.unsubscribe();

		if (this.id()) {
			// Subscribe to contact Observable and update signal
			this.contactSubscription = this.contactService
				.getContactById(this.id())
				.subscribe((contact) => {
					this.contactForView.set(contact);
				});
		} else {
			this.contactForView.set(undefined);
		}
	}

	/**
	 * Angular lifecycle hook for cleanup when component is destroyed.
	 * Unsubscribes from contact Observable to prevent memory leaks.
	 */
	ngOnDestroy() {
		this.contactSubscription?.unsubscribe();
	}

	/**
	 * Navigates back to the contacts list page.
	 * Used by the back button in the contact view header.
	 *
	 * @example
	 * ```typescript
	 * this.goBack(); // Navigates to /contacts route
	 * ```
	 */
	goBack() {
		this.router.navigate(["/contacts"]);
	}

	/**
	 * Opens the edit contact overlay for the specified contact.
	 * Sets the contact ID for editing and makes overlay visible.
	 *
	 * @param contactId - Firestore document ID of the contact to edit
	 *
	 * @example
	 * ```typescript
	 * this.onEditContact('contact-id-123');
	 * // Opens edit overlay with contact data loaded
	 * ```
	 */
	onEditContact(contactId: string): void {
		this.onEditContactId.set(contactId);
		this.isEditOverlayOpen.set(true);
	}

	/**
	 * Handles successful contact save from the edit overlay.
	 * Closes the overlay and shows success notification.
	 *
	 * @example
	 * ```typescript
	 * // Called automatically by edit overlay on successful save
	 * this.onEditContactSaved();
	 * // Overlay closes and success toast appears
	 * ```
	 */
	onEditContactSaved(): void {
		this.onCloseEditOverlay();
		this.toastService.showSuccess("Contact edited successfully");
	}

	/**
	 * Initiates the two-step delete confirmation process for safe contact deletion.
	 *
	 * **Two-Step Delete Process:**
	 * 1. First call: Shows warning toast with "Delete" action button
	 * 2. User must click "Delete" button in toast to confirm
	 * 3. Auto-timeout resets confirmation after 5 seconds if no action
	 *
	 * This approach prevents accidental deletions while maintaining good UX.
	 *
	 * @param contactId - Firestore document ID of the contact to delete
	 * @returns Promise that resolves when delete process is initiated
	 *
	 * @example
	 * ```typescript
	 * // First tap - shows confirmation toast
	 * await this.onDeleteContact('contact-id-123');
	 * // User sees: "Delete this contact?" with Delete button
	 *
	 * // User clicks Delete button in toast -> performDelete() is called
	 * ```
	 */
	async onDeleteContact(contactId: string) {
		if (!contactId) return;

		if (this.deleteConfirmationContactId === contactId) {
			// User clicked delete while confirmation toast is already shown
			// This shouldn't happen with new UX, but keep as fallback
			this.performDelete(contactId);
		} else {
			// First delete tap - show clickable confirmation toast
			this.deleteConfirmationContactId = contactId;

			const cancelAction: ToastAction = {
				label: "Cancel",
				handler: () => {
					this.resetDeleteConfirmation();
				},
			};

			const confirmAction: ToastAction = {
				label: "Delete",
				handler: () => this.performDelete(contactId),
			};

			this.toastService.showWarningWithActions("Delete this contact?", [
				cancelAction,
				confirmAction,
			]);

			this.deleteConfirmationTimeout = setTimeout(() => {
				this.resetDeleteConfirmation();
			}, 5000);
		}
	}

	/**
	 * Performs the actual contact deletion after user confirmation.
	 * Called when user clicks the "Delete" button in the confirmation toast.
	 *
	 * Process:
	 * 1. Deletes contact from Firestore via ContactService
	 * 2. Shows success toast notification
	 * 3. Resets delete confirmation state
	 * 4. Navigates back to contacts list
	 * 5. Shows error toast if deletion fails
	 *
	 * @param contactId - Firestore document ID of the contact to delete
	 * @returns Promise that resolves when deletion completes
	 * @throws Error if Firestore deletion fails
	 *
	 * @example
	 * ```typescript
	 * // Called automatically when user clicks Delete in toast
	 * await this.performDelete('contact-id-123');
	 * // Contact deleted, success toast shown, navigated back
	 * ```
	 */
	private async performDelete(contactId: string) {
		try {
			await this.contactService.deleteContact(contactId);
			this.toastService.showSuccess("Contact deleted successfully");
			this.resetDeleteConfirmation();
			this.goBack();
		} catch {
			this.toastService.showError("Failed to delete contact. Please try again.");
			this.resetDeleteConfirmation();
		}
	}

	/**
	 * Resets the delete confirmation state to initial state.
	 * Clears the pending contact ID and cancels any active timeout.
	 *
	 * Called in these scenarios:
	 * - After successful deletion
	 * - After deletion error
	 * - When 5-second timeout expires
	 *
	 * @example
	 * ```typescript
	 * this.resetDeleteConfirmation();
	 * // deleteConfirmationContactId = null
	 * // timeout cleared if active
	 * ```
	 */
	private resetDeleteConfirmation() {
		this.deleteConfirmationContactId = null;
		if (this.deleteConfirmationTimeout) {
			clearTimeout(this.deleteConfirmationTimeout);
			this.deleteConfirmationTimeout = undefined;
		}
	}

	/**
	 * Closes the edit contact overlay.
	 * Hides the edit overlay by setting the signal to false.
	 *
	 * @example
	 * ```typescript
	 * this.onCloseEditOverlay(); // Hides edit overlay
	 * // isEditOverlayOpen signal becomes false
	 * ```
	 */
	onCloseEditOverlay() {
		this.isEditOverlayOpen.set(false);
	}
}
