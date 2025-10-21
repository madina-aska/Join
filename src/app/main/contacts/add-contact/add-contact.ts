import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output, inject } from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import { RouterModule } from "@angular/router";
import { Contact } from "@core/interfaces/contact";
import { ContactService } from "@core/services/contact-service";
import { ToastService } from "@shared/services/toast.service";

/**
 * Component for adding new contacts to the application.
 *
 * Features:
 * - Reactive form with validation for name, email, and phone
 * - Auto-capitalization of first and last names
 * - Real-time form validation with custom patterns
 * - Integration with ContactService for Firestore operations
 * - Toast notifications for success/error feedback
 * - Responsive modal design for mobile and desktop
 *
 * Form Validation:
 * - Name: Requires first and last name, supports German umlauts
 * - Email: Standard email validation with custom pattern
 * - Phone: International phone number format (+, numbers, spaces, dashes)
 *
 * @example
 * ```html
 * <app-add-contact
 *   (closed)="onOverlayClosed()"
 *   (open)="onOverlayOpened()">
 * </app-add-contact>
 * ```
 */
@Component({
	selector: "app-add-contact",
	standalone: true,
	imports: [FormsModule, RouterModule, CommonModule, ReactiveFormsModule],
	templateUrl: "./add-contact.html",
	styleUrl: "./add-contact.scss",
})
export class AddContact {
	/** Controls overlay visibility state */
	isOverlayOpen = false;

	/** Injected contact service for Firestore operations */
	contactService = inject(ContactService);

	/** Injected form builder for reactive forms */
	private fb = inject(FormBuilder);

	/** Injected toast service for user notifications */
	private ts = inject(ToastService);

	/**
	 * Reactive form group with validation for contact creation.
	 *
	 * Form Fields:
	 * - name: First and last name (auto-capitalized, German umlauts supported)
	 * - email: Valid email address with custom pattern validation
	 * - phone: International phone number format
	 */
	contactForm: FormGroup = this.fb.group({
		name: ["", [Validators.required, Validators.pattern(/^[a-zA-ZäöüÄÖÜß]+ [a-zA-ZäöüÄÖÜß]+$/)]],
		email: [
			"",
			[
				Validators.required,
				Validators.email,
				Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
			],
		],
		phone: ["", [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
	});

	/** Emitted when the add contact overlay is closed */
	@Output() closed = new EventEmitter<void>();

	/** Emitted when the add contact overlay is opened */
	@Output() open = new EventEmitter<void>();

	@Output() contactCreated = new EventEmitter<string>();

	/**
	 * Capitalizes the first letter of each word in a name string.
	 * Used for automatic name formatting during input.
	 *
	 * @param name - Full name string to capitalize
	 * @returns Capitalized name string
	 *
	 * @example
	 * ```typescript
	 * this.capitalizeNames('john doe'); // Returns: 'John Doe'
	 * this.capitalizeNames('mary-ann smith'); // Returns: 'Mary-ann Smith'
	 * ```
	 */
	private capitalizeNames(name: string): string {
		return name
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	}

	/**
	 * Handles name input events and applies auto-capitalization.
	 * Only capitalizes when user has entered both first and last name.
	 *
	 * @param event - Input event from name form field
	 *
	 * @example
	 * ```html
	 * <input (input)="onNameInput($event)" formControlName="name">
	 * ```
	 */
	onNameInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const capitalizedValue = this.capitalizeNames(input.value);

		// Nur aktualisieren wenn es mindestens 2 Wörter mit Leerzeichen gibt
		if (input.value.includes(" ") && input.value.split(" ").length >= 2) {
			this.contactForm.patchValue({
				name: capitalizedValue,
			});
		}
	}

	/**
	 * Handles form submission for creating a new contact.
	 * Validates form, creates contact object, and saves to Firestore.
	 * Shows success/error toast notifications and manages overlay state.
	 *
	 * @example
	 * ```html
	 * <form (ngSubmit)="onSubmit()">
	 * ```
	 */
	onSubmit() {
		if (this.contactForm.valid) {
			const formValue = this.contactForm.value;
			const capitalizedName = this.capitalizeNames(formValue.name);

			const newContact: Contact = {
				name: capitalizedName,
				email: formValue.email,
				telephone: formValue.phone,
				initials: this.contactService.generateInitials(capitalizedName),
				color: this.getRandomColor(),
			};

			this.contactService
				.addContact(newContact)
				.then((newId: string) => {
					this.ts.showSuccess("Contact successfully created");
					this.contactCreated.emit(newId);
					this.contactForm.reset();
					this.closeOverlay();
				})
				.catch((error) => {
					this.ts.showError("Save error");
				});
		}
	}

	/**
	 * Generates a random color identifier for contact avatar.
	 *
	 * @returns Random number between 1 and 10 for CSS color variables
	 *
	 * @example
	 * ```typescript
	 * const colorId = this.getRandomColor(); // Returns: 3
	 * // Used as: var(--avatar-color-3)
	 * ```
	 */
	getRandomColor(): number {
		return Math.floor(Math.random() * 10) + 1;
	}

	/**
	 * Emits the `closed` event to signal that the overlay should be closed.
	 */
	closeOverlay() {
		this.closed.emit();
	}

	/**
	 * Emits the `open` event to signal that the overlay should be opened.
	 */
	openOverlay() {
		this.open.emit();
	}

	/**
	 * Handles the action to add a new contact.
	 * Opens the contact form overlay.
	 */
	onAddContact(): void {
		// Opens the add contact form overlay
		this.openOverlay();
	}

	/**
	 * Handles the action to edit an existing contact.
	 * Intended to trigger edit mode (implementation pending).
	 */
	onEditContact(): void {
		// Opens edit mode for existing contact
	}

	/**
	 * Handles the click event to create a contact.
	 * Triggers the form submission logic.
	 */
	onCreateContactClick() {
		this.onSubmit();
	}

	/**
	 * Handles the cancel action.
	 * Closes the overlay without saving changes.
	 */
	onCancelClick() {
		this.closeOverlay();
	}
}
