import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener, inject, input, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Router } from "@angular/router";
import { Contact } from "@core/interfaces/contact";
import { Task } from "@core/interfaces/task";
import { ContactService } from "@core/services/contact-service";
import { TaskService } from "@core/services/task-service";
import { Toast } from "@shared/components/toast/toast";

/**
 * The AddTaskForm component provides a full-featured form
 * for creating new tasks, assigning contacts, setting categories,
 * managing subtasks, and defining priorities.
 *
 * This component is typically used as a child inside the main Add Task view or modal.
 */
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
	/**
	 * Category in which the new task will be added.
	 * Defaults to `"todo"`.
	 * @type {import('@angular/core').InputSignal<"todo" | "in-progress" | "awaiting-feedback" | "done">}
	 */
	categoryToAdd = input<"todo" | "in-progress" | "awaiting-feedback" | "done">("todo");

	/**
	 * Event emitter that notifies the parent component when a task has been successfully added.
	 * @type {import('@angular/core').OutputEmitter<void>}
	 */
	addedTask = output<void>();
	title = "";
	description = "";
	dueDate = "";
	category = "";
	subtask = "";

	/**
	 * List of subtasks belonging to the current task being created.
	 */
	subtasks: {
		id: string;
		title: string;
		completed: boolean;
		createdAt?: Date;
		isEditing?: boolean;
	}[] = [];

	/**
	 * All available contacts fetched from the ContactService.
	 * @type {Contact[]}
	 */
	contacts: Contact[] = [];

	/**
	 * Contacts currently assigned to this task.
	 * @type {Contact[]}
	 */
	assignedTo: Contact[] = [];

	contactService = inject(ContactService);
	taskService = inject(TaskService);
	router = inject(Router);
	eRef = inject(ElementRef);

	/** Today's date, used as a minimum for the datepicker. */
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

	/**
	 * Currently selected priority level for the task.
	 * Can be `"low"`, `"medium"`, or `"urgent"`.
	 */
	selectedPriority: "medium" | "low" | "urgent" = "medium";

	/**
	 * Sets the task priority.
	 * @param {"medium" | "low" | "urgent"} priority - The selected priority level.
	 */
	setPriority(priority: "medium" | "low" | "urgent") {
		this.selectedPriority = priority;
	}

	/** Toggles the assigned contacts dropdown visibility. */
	onInputClick() {
		this.assignedDropdownOpen = !this.assignedDropdownOpen;
		this.categoryDropdownOpen = false;
	}

	/** Toggles the category selection dropdown visibility. */
	onCategoryClick() {
		this.categoryDropdownOpen = !this.categoryDropdownOpen;
		this.assignedDropdownOpen = false;
	}

	/**
	 * Selects a category and closes the dropdown after a short delay.
	 * @param {string} cat - The chosen category name.
	 */
	selectCategory(cat: string) {
		this.activeCategory = cat;
		this.category = cat;

		setTimeout(() => {
			this.categoryDropdownOpen = false;
			this.activeCategory = null;
		}, 120);
	}

	/**
	 * Retrieves a contact by name, returning a placeholder if not found.
	 * @param {string} name - Contact's full name.
	 * @returns {Contact | { initials: string; color: string }}
	 */
	getContactByName(name: string) {
		return (
			this.contacts.find((contact) => contact.name === name) || { initials: "?", color: "default" }
		);
	}

	/**
	 * Checks if a contact is currently assigned to the task.
	 * @param {Contact} contact - The contact to check.
	 * @returns {boolean}
	 */
	isAssigned(contact: Contact) {
		return this.assignedTo.some((c) => c.id === contact.id);
	}

	/**
	 * Toggles a contact’s assigned status.
	 * @param {Contact} contact - The contact to assign or unassign.
	 */
	toggleAssigned(contact: Contact) {
		if (this.isAssigned(contact)) {
			this.assignedTo = this.assignedTo.filter((c) => c.id !== contact.id);
		} else {
			this.assignedTo.push(contact);
		}
	}

	/**
	 * Returns whether multiple required fields are missing after user interaction.
	 * @returns {boolean}
	 */
	get showActionError(): boolean {
		let emptyFields = 0;
		if ((this.titleTouched || this.formSubmitAttempted) && !this.title) emptyFields++;
		if ((this.dueDateTouched || this.formSubmitAttempted) && !this.dueDate) emptyFields++;
		if ((this.categoryTouched || this.formSubmitAttempted) && !this.category) emptyFields++;
		return emptyFields > 1;
	}

	/**
	 * Marks form fields as "touched" when the user leaves them.
	 * @param {"title" | "dueDate" | "category"} field
	 */
	onBlur(field: string) {
		if (field === "title") this.titleTouched = true;
		if (field === "dueDate") this.dueDateTouched = true;
		if (field === "category") this.categoryTouched = true;
	}

	/** Initializes the component by loading all contacts. */
	ngOnInit() {
		this.loadContacts();
	}

	/**
	 * Loads all contacts from the ContactService once they are available.
	 */
	loadContacts() {
		const checkInterval = setInterval(() => {
			if (Object.keys(this.contactService.contactsObject).length > 0) {
				this.contacts = Object.values(this.contactService.contactsObject).flat();
				clearInterval(checkInterval);
			}
		}, 200);
	}

	/** Resets all form fields and UI states to their initial values. */
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

	/**
	 * Creates a new task after validating form fields.
	 * Shows a toast message on success or failure.
	 */
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
			status: this.categoryToAdd(),
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
			this.addedTask.emit();
			this.formSubmitAttempted = false;

			setTimeout(() => {
				this.router.navigate(["/board"]);
			}, 1000);
		} catch (error) {
			console.error("Failed to add task:", error);
		}
	}

	/** Returns true if all required fields (title, due date, category) are filled. */
	get allRequiredFieldsFilled(): boolean {
		return !!this.title && !!this.dueDate && !!this.category;
	}

	/** Adds a new subtask to the list. */
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

	/**
	 * Deletes a subtask by ID.
	 * @param {string} id - Subtask ID to remove.
	 */
	deleteSubtask(id: string) {
		if (!this.subtasks) return;
		this.subtasks = this.subtasks.filter((s) => s.id !== id);
	}

	/**
	 * Enables edit mode for a subtask.
	 * @param {any} subtask - The subtask object being edited.
	 */
	editSubtask(subtask: any) {
		subtask.isEditing = true;
	}

	/**
	 * Saves a subtask’s edited title and exits edit mode.
	 * @param {any} subtask - The subtask object being saved.
	 */
	saveSubtask(subtask: any) {
		if (!subtask.title?.trim()) return;
		subtask.title = subtask.title.trim();
		subtask.isEditing = false;
	}

	toastVisible = signal(false);
	toastMessage = signal("");
	toastType: "success" | "error" = "success";

	/**
	 * Displays a temporary toast notification message.
	 * @param {string} message - The message to display.
	 * @param {"success" | "error"} [type="success"] - The toast type (affects styling).
	 */
	showToast(message: string, type: "success" | "error" = "success") {
		this.toastMessage.set(message);
		this.toastType = type;
		this.toastVisible.set(true);

		setTimeout(() => {
			this.toastVisible.set(false);
		}, 3000);
	}

	/**
	 * Detects clicks outside the dropdown elements and closes them when appropriate.
	 * Prevents dropdowns from staying open when the user clicks elsewhere.
	 * @param {MouseEvent} event
	 */
	@HostListener("document:click", ["$event"])
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const assignedWrap = this.eRef.nativeElement.querySelector(
			".assigned-wrap",
		) as HTMLElement | null;
		const categoryWrap = this.eRef.nativeElement.querySelector(
			".category-wrap",
		) as HTMLElement | null;

		const clickedInsideAssigned = assignedWrap ? assignedWrap.contains(target) : false;
		const clickedInsideCategory = categoryWrap ? categoryWrap.contains(target) : false;

		const clickedInMatDatepicker = !!target.closest(
			".mat-datepicker-content, .mat-datepicker-popup, .mat-datepicker-calendar",
		);

		if (!clickedInsideAssigned && !clickedInMatDatepicker) {
			this.assignedDropdownOpen = false;
		}
		if (!clickedInsideCategory && !clickedInMatDatepicker) {
			this.categoryDropdownOpen = false;
		}
	}
}
