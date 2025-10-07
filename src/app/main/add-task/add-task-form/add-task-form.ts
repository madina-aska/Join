import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Contact } from "@core/interfaces/contact";
import { ContactService } from "@core/services/contact-service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatNativeDateModule } from "@angular/material/core";

@Component({
	selector: "app-add-task-form",
	imports: [
		FormsModule,
		CommonModule,
		MatDatepickerModule,
		MatFormFieldModule,
		MatInputModule,
		MatNativeDateModule,
	],
	templateUrl: "./add-task-form.html",
	styleUrl: "./add-task-form.scss",
})
export class AddTaskForm {
	title = "";
	description = "";
	dueDate = "";
	category = "";
	subtask = "";

	contacts: Contact[] = [];
	assignedTo: Contact[] = [];

	contactService = inject(ContactService);

	titleFocus = false;
	dueDateFocus = false;
	categoryFocus = false;
	descriptionFocus = false;
	assignedFocus = false;
	subtaskFocus = false;

	titleTouched = false;
	dueDateTouched = false;
	categoryTouched = false;

	assignedDropdownOpen = false;
	categoryDropdownOpen = false;

	activeItem: string | null = null;
	activeCategory: string | null = null;

	selectedPriority = "medium";
	setPriority(priority: string) {
		this.selectedPriority = priority;
	}

	onInputClick() {
		this.assignedDropdownOpen = !this.assignedDropdownOpen;
	}

	onCategoryClick() {
		this.categoryDropdownOpen = !this.categoryDropdownOpen;
	}

	selectCategory(cat: string) {
		this.activeCategory = cat;
		this.category = cat;

		setTimeout(() => {
			this.categoryDropdownOpen = false;
			this.activeCategory = null;
		}, 120);
	}

	getContactByName(name: string) {
		return (
			this.contacts.find((contact) => contact.name === name) || { initials: "?", color: "default" }
		);
	}

	isAssigned(contact: Contact) {
		return this.assignedTo.some((c) => c.id === contact.id);
	}

	toggleAssigned(contact: Contact) {
		if (this.isAssigned(contact)) {
			this.assignedTo = this.assignedTo.filter((c) => c.id !== contact.id);
		} else {
			this.assignedTo.push(contact);
		}
	}

	get showActionError(): boolean {
		return (
			(this.titleTouched && !this.title) ||
			(this.dueDateTouched && !this.dueDate) ||
			(this.categoryTouched && !this.category)
		);
	}

	onBlur(field: string) {
		if (field === "title") this.titleTouched = true;
		if (field === "dueDate") this.dueDateTouched = true;
		if (field === "category") this.categoryTouched = true;
	}

	// get live contacts from Firestore
	ngOnInit() {
		this.loadContacts();
	}

	loadContacts() {
		const checkInterval = setInterval(() => {
			if (Object.keys(this.contactService.contactsObject).length > 0) {
				this.contacts = Object.values(this.contactService.contactsObject).flat();
				clearInterval(checkInterval);
			}
		}, 200);
	}

	clearForm() {
		this.title = "";
		this.description = "";
		this.dueDate = "";
		this.category = "";
		this.subtask = "";
		this.selectedPriority = "";
		this.assignedTo = [];

		this.titleFocus = false;
		this.dueDateFocus = false;
		this.categoryFocus = false;
		this.descriptionFocus = false;
		this.assignedFocus = false;
		this.subtaskFocus = false;
		this.categoryTouched = false;
		this.assignedDropdownOpen = false;
		this.categoryDropdownOpen = false;
		this.activeItem = null;
		this.activeCategory = null;
	}
}
