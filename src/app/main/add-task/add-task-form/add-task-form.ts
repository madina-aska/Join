import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Contact } from "@core/interfaces/contact";
import { ContactService } from "@core/services/contact-service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatNativeDateModule } from "@angular/material/core";
import { TaskService } from "@core/services/task-service";
import { Task } from "@core/interfaces/task";
import { Toast } from "@shared/components/toast/toast";
import { Router } from "@angular/router";

@Component({
	selector: "app-add-task-form",
	imports: [
		FormsModule,
		CommonModule,
		MatDatepickerModule,
		MatFormFieldModule,
		MatInputModule,
		MatNativeDateModule,
		Toast,
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
	subtasks: {
		id: string;
		title: string;
		completed: boolean;
		createdAt?: Date;
		isEditing?: boolean;
	}[] = [];

	contacts: Contact[] = [];
	assignedTo: Contact[] = [];

	contactService = inject(ContactService);
	taskService = inject(TaskService);
	router = inject(Router);
	today = new Date();

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

	selectedPriority: "medium" | "low" | "urgent" = "medium";
	setPriority(priority: "medium" | "low" | "urgent") {
		this.selectedPriority = priority;
	}

	onInputClick() {
		this.assignedDropdownOpen = !this.assignedDropdownOpen;
		if (this.assignedDropdownOpen) {
			this.categoryDropdownOpen = false;
		}
	}

	onCategoryClick() {
		this.categoryDropdownOpen = !this.categoryDropdownOpen;
		if (this.categoryDropdownOpen) {
			this.assignedDropdownOpen = false;
		}
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
		let emptyFields = 0;
		if ((this.titleTouched || this.formSubmitAttempted) && !this.title) emptyFields++;
		if ((this.dueDateTouched || this.formSubmitAttempted) && !this.dueDate) emptyFields++;
		if ((this.categoryTouched || this.formSubmitAttempted) && !this.category) emptyFields++;
		return emptyFields > 1;
	}

	onBlur(field: string) {
		if (field === "title") this.titleTouched = true;
		if (field === "dueDate") this.dueDateTouched = true;
		if (field === "category") this.categoryTouched = true;
	}

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
		this.subtasks = [];
		this.assignedTo = [];
		this.selectedPriority = "medium";

		this.titleFocus = false;
		this.dueDateFocus = false;
		this.categoryFocus = false;
		this.descriptionFocus = false;
		this.assignedFocus = false;
		this.subtaskFocus = false;

		this.titleTouched = false;
		this.dueDateTouched = false;
		this.categoryTouched = false;

		this.assignedDropdownOpen = false;
		this.categoryDropdownOpen = false;
		this.activeItem = null;
		this.activeCategory = null;
	}
	formSubmitAttempted = false;

	async createTask() {
		this.formSubmitAttempted = true;

		if (!this.title || !this.category || !this.dueDate) {
			this.showToast("Please fill all required fields", "error");
			return;
		}

		const newTask: Task = {
			title: this.title,
			description: this.description,
			category: this.category as "User Story" | "Technical Task",
			priority: this.selectedPriority as "low" | "medium" | "urgent",
			status: "todo",
			assignedContacts: this.assignedTo.map((c) => c.id ?? "").filter(Boolean),
			subtasks: this.subtasks.map((s) => ({
				id: s.id,
				title: s.title,
				completed: s.completed,
				createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
			})),
			dueDate: this.dueDate ? new Date(this.dueDate).toISOString() : undefined,

			color: Math.floor(Math.random() * 10) + 1,
		};

		try {
			const taskId = await this.taskService.addTask(newTask);
			this.showToast("Task added to board", "success");
			this.clearForm();
			this.formSubmitAttempted = false;

			setTimeout(() => {
				this.router.navigate(["/board"]);
			}, 1000);
		} catch (error) {
			console.error("Failed to add task:", error);
		}
	}

	get allRequiredFieldsFilled(): boolean {
		return !!this.title && !!this.dueDate && !!this.category;
	}

	addSubtask() {
		if (!this.subtask.trim()) return;

		this.subtasks.push({
			id: Date.now().toString(),
			title: this.subtask,
			completed: false,
			createdAt: new Date(),
			isEditing: false,
		});

		this.subtask = "";
	}

	deleteSubtask(id: string) {
		if (!this.subtasks) return;
		this.subtasks = this.subtasks.filter((s) => s.id !== id);
	}

	editSubtask(subtask: any) {
		subtask.isEditing = true;
	}

	saveSubtask(subtask: any) {
		if (!subtask.title?.trim()) return;
		subtask.title = subtask.title.trim();
		subtask.isEditing = false;
	}

	toastVisible = signal(false);
	toastMessage = signal("");
	toastType: "success" | "error" = "success";

	showToast(message: string, type: "success" | "error" = "success") {
		this.toastMessage.set(message);
		this.toastType = type;
		this.toastVisible.set(true);

		setTimeout(() => {
			this.toastVisible.set(false);
		}, 3000);
	}
}
