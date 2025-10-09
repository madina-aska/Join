import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, input, Output, signal } from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";

//  Imports für Angular CDK Drag and Drop
import { CdkDragDrop, DragDropModule, transferArrayItem } from "@angular/cdk/drag-drop";

// Komponenten-Imports
import { Button } from "@shared/components/button/button";
import { SearchField } from "@shared/components/search-field/search-field";
import { SvgButton } from "@shared/components/svg-button/svg-button";
import { ToastService } from "@shared/services/toast.service";

// Angenommener Import für Task-Datenstruktur und Service
import { Task } from "@app/core/interfaces/task";
import { TaskService } from "@app/core/services/task-service";
import { TaskView } from "@app/main/board/task-view/task-view";
import { BoardCard } from "../board-card/board-card";
import { EditTask } from "../edit-task/edit-task";

// Definiere die Status-Schlüssel
type TaskStatusKey = "todo" | "in-progress" | "awaiting-feedback" | "done";

// Konstante, die alle Status-IDs enthält
const ALL_STATUS_KEYS: TaskStatusKey[] = ["todo", "in-progress", "awaiting-feedback", "done"];

@Component({
	selector: "app-board-view",
	// DragDropModule hinzugefügt, muss installiert werden!!!
	imports: [
		CommonModule,
		Button,
		SearchField,
		BoardCard,
		TaskView,
		EditTask,
		DragDropModule,
		SvgButton,
	],
	templateUrl: "./board-view.html",
	styleUrl: "./board-view.scss",
	standalone: true,
})
export class BoardView {
	// --- DEPENDENCIES ---
	firestore = inject(Firestore);
	router = inject(Router);
	toastService = inject(ToastService);
	taskService = inject(TaskService);

	// --- INPUTS & STATE ---
	id = input<string>("");
	isAddTaskOverlayOpen = signal(false);
	selectedTaskId = signal<string | null>(null);
	selectedTaskData = signal<Task | null>(null);

	@Output() addTaskClicked = new EventEmitter<void>();

	//Liste der Status-IDs für cdkDropListConnectedTo
	dropListIds = ALL_STATUS_KEYS;

	todoTasks = signal<Task[]>([]);
	inProgressTasks = signal<Task[]>([]);
	feedbackTasks = signal<Task[]>([]);
	doneTasks = signal<Task[]>([]);

	allTasks: any = [];

	private filteredTasks = signal<Task[]>([]);

	constructor() {
		// Filtere und setze die Spalten-Signals unter Verwendung der korrekten Status-Keys
		this.taskService.tasksObject$.subscribe((tasks) => {
			this.todoTasks.set(tasks["todo"] || []);
			this.inProgressTasks.set(tasks["in-progress"] || []);
			this.feedbackTasks.set(tasks["awaiting-feedback"] || []);
			this.doneTasks.set(tasks["done"] || []);
			this.allTasks = tasks;
			//this.filteredTasks.set(tasks);
		});

		/*console.log("[BoardView Effect] Tasks updated from Service:", {
			todo: this.todoTasks().length,
			inProgress: this.inProgressTasks().length,
			feedback: this.feedbackTasks().length,
			done: this.doneTasks().length,
			totalServiceTasks: allTasksFlat.length,
		});*/
	}

	// --- NEUE METHODEN FÜR DRAG & DROP ---

	/**
	 * Wird aufgerufen, wenn ein Element in eine Drop-Zone verschoben wird.
	 * Aktualisiert das lokale Array und die Datenbank.
	 */
	drop(event: CdkDragDrop<Task[]>) {
		// Wenn das Element in der GLEICHEN Liste verschoben wurde
		if (event.previousContainer === event.container) {
			// Sortierung nach Priority erfolgt im TaskService
		} else {
			// Element wurde in eine ANDERE Liste verschoben (Status ändern)
			// 1. Lokales Array aktualisieren (wird sofort im UI sichtbar)
			transferArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex,
			);

			// 2. Hole die verschobene Task (sie befindet sich jetzt im neuen Array)
			// das Task-Objekt aus den cdkDragData holen, das als 'Task' getypt ist
			const movedTask = event.item.data as Task;

			// 3. Bestimme den NEUEN Status (die ID der Ziel-Drop-Zone)
			const newStatus = event.container.id as TaskStatusKey;

			// 4. Datenbank-Aktualisierung auslösen
			this.updateTaskStatus(movedTask.id!, newStatus);
		}
	}

	/**
	 * Aktualisiert den Status einer Task in der Datenbank (Firestore).
	 * @param taskId Die ID der Task.
	 * @param newStatus Der neue Status ('todo', 'in-progress', etc.).
	 */
	updateTaskStatus(taskId: string, newStatus: TaskStatusKey) {
		this.taskService
			.updateTask(taskId, { status: newStatus })
			.then(() => {
				// Die TaskService-onSnapshot-Funktion wird automatisch alle Tasks neu laden
				// und die UI dank Angular Signals/Change Detection aktualisieren.
				this.toastService.showSuccess(
					"Task Status aktualisiert",
					`Die Task wurde nach "${this.formatStatus(newStatus)}" verschoben.`,
				);
			})
			.catch((error) => {
				console.error("Fehler beim Aktualisieren des Task-Status:", error);
				this.toastService.showError(
					"Fehler",
					"Der Task-Status konnte in der Datenbank nicht aktualisiert werden.",
				);
			});
	}

	/** Hilfsfunktion zum Formatieren des Status für die Toast-Nachricht. */
	private formatStatus(status: TaskStatusKey): string {
		switch (status) {
			case "todo":
				return "To Do";
			case "in-progress":
				return "In Progress";
			case "awaiting-feedback":
				return "Awaiting Feedback";
			case "done":
				return "Done";
			default:
				return status;
		}
	}

	// --- METHODEN FÜR DIE DETAILANSICHT (Overlay Steuerung) ---

	/**
	 * Öffnet die Task-Detailansicht (TaskView) für die gegebene Task-ID.
	 */
	openTaskDetail(taskId: string) {
		this.selectedTaskId.set(taskId);
		const task = this.taskService.allTasks.find((t) => t.id === taskId);
		this.selectedTaskData.set(task ?? null);
	}

	/**
	 * Schließt die Task-Detailansicht (TaskView).
	 */
	closeTaskDetail() {
		this.selectedTaskId.set(null);
	}

	isEditTaskOpen = signal(false);

	openEditTask() {
		this.isEditTaskOpen.set(true);
	}

	closeEditTask() {
		this.isEditTaskOpen.set(false);
	}

	// --- METHODEN FÜR SUCHE ETC. ---

	/**
	 * Filtert Tasks basierend auf dem Suchbegriff in Titel oder Beschreibung.
	 */
	onSearch(term: string) {
		console.log("[BoardView] search triggered with:", term);
		const allTasksFlat = Object.values(this.allTasks).flat() as Task[];

		if (!term) {
			this.filterTasks(allTasksFlat);
			return;
		}

		const lowerTerm = term.toLowerCase();

		// Filtere das flache Array
		const filtered = allTasksFlat.filter(
			(task: Task) =>
				task.title.toLowerCase().includes(lowerTerm) ||
				task.description?.toLowerCase().includes(lowerTerm),
		);

		this.filterTasks(filtered); // Wende den Filter an und aktualisiere die Spalten
	}

	/**
	 * Filtert Tasks in die entsprechenden Spalten-Signals.
	 */
	filterTasks(tasks: Task[]) {
		this.todoTasks.set(tasks.filter((t) => t.status === "todo"));
		this.inProgressTasks.set(tasks.filter((t) => t.status === "in-progress"));
		this.feedbackTasks.set(tasks.filter((t) => t.status === "awaiting-feedback"));
		this.doneTasks.set(tasks.filter((t) => t.status === "done"));
	}
	/**
   *   openAddTaskOverlay() {
    this.isAddTaskOverlayOpen.set(true);
    this.router.navigate(['/main/add-task']);
  }
   */
	/**
	 * Öffnet das Add-Task Overlay.
	 */
	openAddTaskOverlay() {
		this.addTaskClicked.emit();
	}
}
