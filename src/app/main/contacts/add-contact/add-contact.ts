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
import { Contact } from "app/core/interfaces/contact";
import { ContactService } from "app/core/services/contact-service";

@Component({
	selector: "app-add-contact",
	standalone: true,
	imports: [FormsModule, RouterModule, CommonModule, ReactiveFormsModule],
	templateUrl: "./add-contact.html",
	styleUrl: "./add-contact.scss",
})
export class AddContact {
	isOverlayOpen = false;
	contactService = inject(ContactService);

	private fb = inject(FormBuilder);

	contactForm: FormGroup = this.fb.group({
		name: [
			"",
			[Validators.required, Validators.pattern(/^[A-ZÄÖÜa-zäöüß]+(?:\s[A-ZÄÖÜa-zäöüß]+)+$/)],
		],
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

	@Output() closed = new EventEmitter<void>();
	@Output() open = new EventEmitter<void>();

	onSubmit() {
		if (this.contactForm.valid) {
			const formValue = this.contactForm.value;

			const newContact: Contact = {
				name: formValue.name,
				email: formValue.email,
				telephone: formValue.phone,
				initials: this.contactService.generateInitials(formValue.name),
				color: this.getRandomColor(),
			};

			this.contactService
				.addContact(newContact)
				.then(() => {
					alert("Save contact!");
					this.contactForm.reset();
					this.closeOverlay();
				})
				.catch((error) => {
					alert("Save contact error");
					console.error(error);
				});
		}
	}

	getRandomColor(): number {
		return Math.floor(Math.random() * 10) + 1;
	}

	closeOverlay() {
		this.closed.emit();
	}

	openOverlay() {
		this.open.emit();
	}

	onAddContact(): void {
		console.log("Add contact clicked!");
		// This can open the form or do other actions
		this.openOverlay();
	}

	onEditContact(): void {
		console.log("Edit contact clicked!");
		// This can open edit mode or navigate to edit
	}

	onNameChange(value: string) {
		this.contactForm.patchValue({ name: value });
	}

	onEmailChange(value: string) {
		this.contactForm.patchValue({ email: value });
	}

	onPhoneChange(value: string) {
		this.contactForm.patchValue({ phone: value });
	}

	onCreateContactClick() {
		this.onSubmit();
	}

	onCancelClick() {
		this.closeOverlay();
	}
}
