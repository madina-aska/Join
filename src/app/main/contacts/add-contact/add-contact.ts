import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import { RouterModule } from "@angular/router";

@Component({
	selector: "app-add-contact",
	standalone: true,
	imports: [FormsModule, RouterModule, CommonModule, ReactiveFormsModule],
	templateUrl: "./add-contact.html",
	styleUrl: "./add-contact.scss",
})
export class AddContact {
	contactForm: FormGroup;
	isOverlayOpen = false;

	@Output() closed = new EventEmitter<void>();
	@Output() open = new EventEmitter<void>();

	constructor(private fb: FormBuilder) {
		this.contactForm = this.fb.group({
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
	}

	onSubmit() {
		if (this.contactForm.valid) {
			console.log(this.contactForm.value);
			alert("Kontakt erfolgreich erstellt!");
			this.contactForm.reset();
			this.closeOverlay();
		}
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
