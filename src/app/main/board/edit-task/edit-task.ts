import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  inject,
} from "@angular/core";
import { Firestore, doc, updateDoc } from "@angular/fire/firestore";
import { FormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Task } from "@app/core/interfaces/task";
import { ContactService } from "@core/services/contact-service";

/**
 * Component for editing a task, including form fields, subtasks, and assignment logic.
 */
@Component({
	selector: "app-edit-task",
	imports: [
		CommonModule,
		FormsModule,
		MatDatepickerModule,
		MatFormFieldModule,
		MatInputModule,
		MatNativeDateModule,
	],
	templateUrl: "./edit-task.html",
	styleUrl: "./edit-task.scss",
})
export class EditTask {
	/**
	 * Creates an instance of EditTask.
	 * @param elementRef Reference to the component's DOM element.
	 * @param renderer Angular renderer for DOM manipulation.
	 */
	constructor(
		private elementRef: ElementRef,
		private renderer: Renderer2,
	) {}

	/** ID of the task to be edited */
	@Input() taskId!: string;

	/**
	 * Sets up a click listener to close dropdowns when clicking outside the component.
	 */
	ngAfterViewInit(): void {
		this.renderer.listen("document", "click", (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const clickedInside = this.elementRef.nativeElement.contains(target);

			if (!clickedInside) {
				this.assignedDropdownOpen = false;
				this.categoryDropdownOpen = false;
			}
		});
	}

	/**
	 * Toggles the assigned contacts dropdown.
	 * @param event Mouse click event
	 */
	toggleAssignedDropdown(event: MouseEvent): void {
		event.stopPropagation();
		this.categoryDropdownOpen = false;
		this.assignedDropdownOpen = !this.assignedDropdownOpen;
	}

	/**
	 * Handles overlay clicks to close dropdowns if clicked outside.
	 * @param event Mouse click event
	 */
	onOverlayClick(event: MouseEvent): void {
		const target = event.target as HTMLElement;
		const clickedDropdown = target.closest(".select-wrap");

		if (!clickedDropdown) {
			this.assignedDropdownOpen = false;
			this.categoryDropdownOpen = false;
		}
	}

	/** Task data passed into the component */
	@Input() taskData!: Task;

	/** Emits when the edit overlay is closed */
	@Output() closed = new EventEmitter<void>();

	/** Emits the updated task after saving */
	@Output() taskUpdated = new EventEmitter<Task>();

	contactService = inject(ContactService);
	firestore = inject(Firestore);

	// Form fields
	title = "";
	description = "";
	dueDate = "";
	category: "User Story" | "Technical Task" = "User Story";
	assignedContacts: string[] = [];
	selectedPriority: "low" | "medium" | "urgent" = "medium";

	// Subtasks array
	subtasks: {
		id: string;
		title: string;
		completed: boolean;
		createdAt?: string | undefined;
		isEditing?: boolean;
	}[] = [];

	// Input buffer for new subtask
	subtask = "";

	// UI focus states
	titleFocus = false;
	descriptionFocus = false;
	dueDateFocus = false;
	categoryFocus = false;
	assignedFocus = false;
	subtaskFocus = false;
	categoryTouched = false;

	// Dropdown states
	assignedDropdownOpen = false;
	activeItem: string | null = null;
	today = new Date();

	categoryDropdownOpen = false;
	activeCategory: string | null = null;

	/**
	 * Initializes form fields based on the provided task data.
	 */
	ngOnInit() {
		if (this.taskData) {
			this.title = this.taskData.title;
			this.description = this.taskData.description ?? "";
			this.dueDate = this.taskData.dueDate
				? new Date(this.taskData.dueDate).toISOString().split("T")[0]
				: "";
			this.category = this.taskData.category;
			this.assignedContacts = this.taskData.assignedContacts ?? [];
			this.selectedPriority = this.taskData.priority;
			this.subtasks = this.taskData.subtasks ?? [];
		}
	}

	/**
	 * Saves the updated task to Firestore and emits the updated task.
	 */
	async saveTask() {
		const task = this.taskData;
		if (!task?.id) return;

		const taskRef = doc(this.firestore, "tasks", task.id);
		await updateDoc(taskRef, {
			title: this.title,
			description: this.description,
			dueDate: this.dueDate,
			category: this.category as "User Story" | "Technical Task",
			assignedContacts: this.assignedContacts,
			priority: this.selectedPriority as "low" | "medium" | "urgent",
			subtasks: this.subtasks,
			updatedAt: new Date().toISOString().split("T")[0],
		});

		this.taskUpdated.emit({
			id: task.id,
			title: this.title,
			description: this.description,
			dueDate: this.dueDate,
			category: this.category as "User Story" | "Technical Task",
			assignedContacts: this.assignedContacts,
			priority: this.selectedPriority as "low" | "medium" | "urgent",
			subtasks: this.subtasks,
			updatedAt: new Date().toISOString().split("T")[0],
			status: task.status!,
			createdAt: task.createdAt!,
			color: task.color,
		});

		this.closeEditOverlay();
	}

	/**
	 * Adds a new subtask to the list.
	 */
	confirmSubtask() {
		const trimmed = this.subtask.trim();
		if (trimmed) {
			this.subtasks.push({
				id: crypto.randomUUID(),
				title: trimmed,
				completed: false,
				createdAt: new Date().toISOString().split("T")[0],
				isEditing: false,
			});
			this.subtask = "";
			this.subtaskFocus = false;
		}
	}

	/**
	 * Enables editing mode for a specific subtask.
	 * @param index Index of the subtask to edit
	 */
	enableEditing(index: number) {
		this.subtasks[index].isEditing = true;
	}

	/**
	 * Confirms the edit of a subtask.
	 * @param index Index of the subtask being edited
	 */
	confirmEdit(index: number) {
		this.subtasks[index].isEditing = false;
	}

	/**
	 * Cancels subtask input and resets focus.
	 */
	cancelSubtask() {
		this.subtask = "";
		this.subtaskFocus = false;
	}

	/**
	 * Handles blur event on subtask input to reset focus if empty.
	 */
	onSubtaskBlur() {
		setTimeout(() => {
			if (!this.subtask.trim()) {
				this.subtaskFocus = false;
			}
		}, 100);
	}

	/**
	 * Removes a subtask from the list.
	 * @param index Index of the subtask to remove
	 */
	removeSubtask(index: number) {
		this.subtasks.splice(index, 1);
	}

	/**
	 * Emits the `closed` event to close the edit overlay.
	 */
	closeEditOverlay() {
		this.closed.emit();
	}

	/**
	 * Sets the selected priority level.
	 * @param priority Priority value to set
	 */
	setPriority(priority: string) {
		this.selectedPriority = priority as "low" | "medium" | "urgent";
	}

	/**
	 * Opens the assigned contacts dropdown.
	 * @param event Mouse click event
	 */
	onInputClick(event: MouseEvent): void {
		event.stopPropagation();
		this.assignedDropdownOpen = true;
	}

	/**
	 * Toggles the category dropdown.
	 */
	onCategoryClick() {
		this.assignedDropdownOpen = false;
		this.categoryDropdownOpen = !this.categoryDropdownOpen;
	}

	/**
	 * Selects a category and closes the dropdown.
	 * @param cat Category to select
	 */
	selectCategory(cat: string) {
		this.activeCategory = cat;
		this.category = cat as "User Story" | "Technical Task";

		setTimeout(() => {
			this.categoryDropdownOpen = false;
			this.activeCategory = null;
		}, 120);
	}

	/**
	 * Checks if a contact is assigned to the task.
	 * @param id Contact ID to check
	 * @returns True if assigned, false otherwise
	 */
	isAssigned(id: string): boolean {
		return this.assignedContacts.includes(id);
	}

	/**
	 * Toggles assignment of a contact.
	 * @param id Contact ID to toggle
	 */
	toggleAssignment(id: string) {
		if (this.isAssigned(id)) {
			this.assignedContacts = this.assignedContacts.filter((cid) => cid !== id);
		} else {
			this.assignedContacts.push(id);
		}
	}

	/**
	 * Returns a comma-separated string of assigned contact names.
	 * @returns Display string of assigned contacts
	 */
	assignedContactsDisplay(): string {
		const allContacts = Object.values(this.contactService.contactsObject).flat();
		return allContacts
			.filter((c) => c.id && this.assignedContacts.includes(c.id))
			.map((c) => c.name)
			.join(", ");
	}
}
