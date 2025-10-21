import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output, inject, input } from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import { Contact } from "@core/interfaces/contact";
import { Task } from "@core/interfaces/task";
import { ContactService } from "@core/services/contact-service";
import { TaskService } from "@core/services/task-service";
import { Button } from "@shared/components/button/button";
import { TaskLabel } from "@shared/components/task-label/task-label";

/**
 * Component for displaying a single task with assigned contacts and subtask handling.
 */
@Component({
	selector: "app-task-view",
	imports: [Button, CommonModule, TaskLabel],
	templateUrl: "./task-view.html",
	styleUrl: "./task-view.scss",
})
export class TaskView implements OnInit {
	/** Injected Firestore instance */
	firestore = inject(Firestore);

	/** The currently loaded task */
	task: Task | null = null;

	/** Input task ID used to load the task */
	taskId = input<string>("");

	/** Injected contact service */
	contactService = inject(ContactService);

	/** Injected task service */
	taskService = inject(TaskService);

	/** List of contacts assigned to the task */
	assignedContacts: Contact[] = [];

	/**
	 * Angular lifecycle hook that initializes the component.
	 * Loads the task and subscribes to contact updates.
	 */
	ngOnInit() {
		this.loadTask(this.taskId());
		this.contactService.allContacts$.subscribe((contacts) => {
			if (this.task?.assignedContacts) {
				this.assignedContacts = contacts.filter((c) =>
					this.task!.assignedContacts!.includes(c.id as string),
				);
			}
		});
	}

	/**
	 * Loads a task by its ID from the task service.
	 * @param id - The ID of the task to load.
	 */
	loadTask(id: string) {
		this.taskService.allTasks$.subscribe((tasks) => {
			this.task = tasks.find((task) => task.id === id) || null;
		});
	}

	/**
	 * Deletes the current task and closes the overlay.
	 */
	async onDeleteClick() {
		if (!this.task?.id) return;

		try {
			await this.taskService.deleteTask(this.task.id);
			this.closeOverlay(); // Close overlay after successful deletion
		} catch (error) {
			console.error("Fehler beim Löschen der Task:", error);
		}
	}

	/** Controls overlay visibility state */
	isOverlayOpen = false;

	/** Emits when the task-view overlay is closed */
	@Output() closed = new EventEmitter<void>();

	/** Emits when the task-view overlay is opened */
	@Output() open = new EventEmitter<void>();

	/** Emits when the edit button is clicked */
	@Output() edit = new EventEmitter<void>();

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
	 * Emits the `edit` event to signal that the task should be edited.
	 */
	onEditClick() {
		this.edit.emit();
	}

	/**
	 * Toggles the completion state of a subtask by its ID.
	 * @param subtaskId - The ID of the subtask to toggle.
	 */
	async toggleSubtask(subtaskId: string) {
		if (!this.task?.id) return;
		try {
			await this.taskService.toggleSubtask(this.task.id, subtaskId);
		} catch (error) {
			console.error("failed toggle Subtask", error);
		}
	}
}
