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
import { Task } from "@app/core/interfaces/task";
import { ContactService } from "@core/services/contact-service";

@Component({
	selector: "app-edit-task",
	imports: [CommonModule, FormsModule],
	templateUrl: "./edit-task.html",
	styleUrl: "./edit-task.scss",
})
export class EditTask {
	constructor(
		private elementRef: ElementRef,
		private renderer: Renderer2,
	) {}

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

	toggleAssignedDropdown(event: MouseEvent): void {
		event.stopPropagation();
		this.assignedDropdownOpen = !this.assignedDropdownOpen;
	}

	onOverlayClick(event: MouseEvent): void {
		const target = event.target as HTMLElement;
		const clickedDropdown = target.closest(".select-wrap");

		if (!clickedDropdown) {
			this.assignedDropdownOpen = false;
			this.categoryDropdownOpen = false;
		}
	}

	@Input() taskData!: Task;
	@Output() closed = new EventEmitter<void>();
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
		createdAt?: string;
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

	categoryDropdownOpen = false;
	activeCategory: string | null = null;

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

	enableEditing(index: number) {
		this.subtasks[index].isEditing = true;
	}

	confirmEdit(index: number) {
		this.subtasks[index].isEditing = false;
	}

	cancelSubtask() {
		this.subtask = "";
		this.subtaskFocus = false;
	}

	onSubtaskBlur() {
		setTimeout(() => {
			if (!this.subtask.trim()) {
				this.subtaskFocus = false;
			}
		}, 100);
	}

	removeSubtask(index: number) {
		this.subtasks.splice(index, 1);
	}

	closeEditOverlay() {
		this.closed.emit();
	}

	setPriority(priority: string) {
		this.selectedPriority = priority as "low" | "medium" | "urgent";
	}

	onInputClick(event: MouseEvent): void {
		event.stopPropagation();
		this.assignedDropdownOpen = true;
	}

	onCategoryClick() {
		this.categoryDropdownOpen = !this.categoryDropdownOpen;
	}

	selectCategory(cat: string) {
		this.activeCategory = cat;
		this.category = cat as "User Story" | "Technical Task";

		setTimeout(() => {
			this.categoryDropdownOpen = false;
			this.activeCategory = null;
		}, 120);
	}

	isAssigned(id: string): boolean {
		return this.assignedContacts.includes(id);
	}

	toggleAssignment(id: string) {
		if (this.isAssigned(id)) {
			this.assignedContacts = this.assignedContacts.filter((cid) => cid !== id);
		} else {
			this.assignedContacts.push(id);
		}
	}

	assignedContactsDisplay(): string {
		const allContacts = Object.values(this.contactService.contactsObject).flat();
		return allContacts
			.filter((c) => c.id && this.assignedContacts.includes(c.id))
			.map((c) => c.name)
			.join(", ");
	}
}
