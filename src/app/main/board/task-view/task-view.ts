import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output, inject, input } from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import { Contact } from "@core/interfaces/contact";
import { Task } from "@core/interfaces/task";
import { ContactService } from "@core/services/contact-service";
import { TaskService } from "@core/services/task-service";
import { Button } from "@shared/components/button/button";
import { TaskLabel } from "@shared/components/task-label/task-label";

@Component({
	selector: "app-task-view",
	imports: [Button, CommonModule, TaskLabel],
	templateUrl: "./task-view.html",
	styleUrl: "./task-view.scss",
})
export class TaskView implements OnInit {
	firestore = inject(Firestore);

	task: Task | null = null;

	taskId = input<string>("");

	contactService = inject(ContactService);
	taskService = inject(TaskService);
	assignedContacts: Contact[] = [];

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

	loadTask(id: string) {
		this.taskService.allTasks$.subscribe((tasks) => {
			this.task = tasks.find((task) => task.id === id) || null;
		});
	}

	async onDeleteClick() {
		if (!this.task?.id) return;

		try {
			await this.taskService.deleteTask(this.task.id);
			this.closeOverlay(); // Overlay schließen nach erfolgreichem Löschen
		} catch (error) {
			console.error("Fehler beim Löschen der Task:", error);
		}
	}

	/** Controls overlay visibility state */
	isOverlayOpen = false;

	/** Emitted when the task-view overlay is closed */
	@Output() closed = new EventEmitter<void>();

	/** Emitted when the task-view overlay is opened */
	@Output() open = new EventEmitter<void>();
	@Output() edit = new EventEmitter<void>();

	closeOverlay() {
		this.closed.emit();
	}

	openOverlay() {
		this.open.emit();
	}

	onEditClick() {
		this.edit.emit();
	}
}
