import { CommonModule } from "@angular/common";
import {
	Component,
	EventEmitter,
	HostListener,
	inject,
	input,
	Output,
	signal,
} from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { CdkDragDrop, DragDropModule, transferArrayItem } from "@angular/cdk/drag-drop";

import { Button } from "@shared/components/button/button";
import { SearchField } from "@shared/components/search-field/search-field";
import { SvgButton } from "@shared/components/svg-button/svg-button";
import { ToastService } from "@shared/services/toast.service";

import { Task } from "@core/interfaces/task";
import { TaskService } from "@core/services/task-service";
import { BoardCard } from "@main/board/board-card/board-card";
import { EditTask } from "@main/board/edit-task/edit-task";
import { TaskView } from "@main/board/task-view/task-view";

/**
 * Type representing the possible task status keys.
 */
type TaskStatusKey = "todo" | "in-progress" | "awaiting-feedback" | "done";

/**
 * Array containing all available task status keys.
 */
const ALL_STATUS_KEYS: TaskStatusKey[] = ["todo", "in-progress", "awaiting-feedback", "done"];

/**
 * The main board component that displays all tasks organized in status columns.
 *
 * It supports:
 * - Task drag & drop between status columns
 * - Searching tasks by title or description
 * - Viewing and editing tasks in overlay modals
 * - Reactive updates via Angular signals and Firestore
 */
@Component({
	selector: "app-board-view",
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

	/** Indicates whether the app is currently in mobile view mode. */
	isMobile = false;

	/** Firestore instance for database operations. */
	firestore = inject(Firestore);

	/** Angular Router for navigation and route changes. */
	router = inject(Router);

	/** Toast service for displaying user notifications. */
	toastService = inject(ToastService);

	/** Task service for retrieving, updating, and managing task data. */
	taskService = inject(TaskService);

	// --- INPUTS & STATE ---

	/** Optional ID input parameter, used to link to specific data if needed. */
	id = input<string>("");

	/** Controls whether the "Add Task" overlay is open. */
	isAddTaskOverlayOpen = signal(false);

	/** Currently selected task ID for detail view. */
	selectedTaskId = signal<string | null>(null);

	/** Task data of the currently selected task. */
	selectedTaskData = signal<Task | null>(null);

	/**
	 * Emits an event when the "Add Task" button is clicked.
	 * The emitted value represents the column category to which the task should belong.
	 */
	@Output() addTaskClicked = new EventEmitter<
		"todo" | "in-progress" | "awaiting-feedback" | "done"
	>();

	/** List of all drop zone IDs for drag-and-drop configuration. */
	dropListIds = ALL_STATUS_KEYS;

	/** Signal array containing all "To Do" tasks. */
	todoTasks = signal<Task[]>([]);

	/** Signal array containing all "In Progress" tasks. */
	inProgressTasks = signal<Task[]>([]);

	/** Signal array containing all "Awaiting Feedback" tasks. */
	feedbackTasks = signal<Task[]>([]);

	/** Signal array containing all "Done" tasks. */
	doneTasks = signal<Task[]>([]);

	/** Flat list of all tasks from all categories. */
	allTasks: any = [];

	/** Signal containing currently filtered tasks for search functionality. */
	private filteredTasks = signal<Task[]>([]);

	/**
	 * Initializes the component, subscribes to the TaskService observable,
	 * and assigns tasks to their respective columns.
	 */
	constructor() {
		this.onResize();

		this.taskService.tasksObject$.subscribe((tasks) => {
			this.todoTasks.set(tasks["todo"] || []);
			this.inProgressTasks.set(tasks["in-progress"] || []);
			this.feedbackTasks.set(tasks["awaiting-feedback"] || []);
			this.doneTasks.set(tasks["done"] || []);
			this.allTasks = tasks;
		});
	}

	/**
	 * Listens for window resize events and updates the `isMobile` flag accordingly.
	 */
	@HostListener("window:resize")
	onResize() {
		const mq = window.matchMedia("(width <= 768px)");
		this.isMobile = mq.matches;
	}

	// --- DRAG & DROP METHODS ---

	/**
	 * Handles the drag-and-drop event when a task card is moved.
	 * Updates the local state and triggers a Firestore update.
	 *
	 * @param event The drag-and-drop event containing source and target containers.
	 */
	drop(event: CdkDragDrop<Task[]>) {
		if (event.previousContainer === event.container) {
			// Same list reorder (handled automatically by TaskService if needed)
		} else {
			transferArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex,
			);

			const movedTask = event.item.data as Task;
			const newStatus = event.container.id as TaskStatusKey;
			this.updateTaskStatus(movedTask.id!, newStatus);
		}
	}

	/**
	 * Updates a task's status in Firestore.
	 * Displays a toast notification on success or failure.
	 *
	 * @param taskId The ID of the task being updated.
	 * @param newStatus The new status for the task.
	 */
	updateTaskStatus(taskId: string, newStatus: TaskStatusKey) {
		this.taskService
			.updateTask(taskId, { status: newStatus })
			.then(() => {
				this.toastService.showSuccess(
					"Task status updated",
					`The task status was changed to "${this.formatStatus(newStatus)}".`,
				);
			})
			.catch((error) => {
				console.error("Error while updating the task status:", error);
				this.toastService.showError(
					"Error",
					"The task status could not be updated in the database.",
				);
			});
	}

	/**
	 * Helper function for formatting a task status for display in notifications.
	 *
	 * @param status The internal status key.
	 * @returns A human-readable status label.
	 */
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

	// --- DETAIL VIEW METHODS ---

	/**
	 * Opens the task detail view (TaskView) for a given task ID.
	 *
	 * @param taskId The ID of the task to display.
	 */
	openTaskDetail(taskId: string) {
		this.selectedTaskId.set(taskId);
		const task = this.taskService.allTasks.find((t) => t.id === taskId);
		this.selectedTaskData.set(task ?? null);
	}

	/**
	 * Closes the currently open task detail view (TaskView).
	 */
	closeTaskDetail() {
		this.selectedTaskId.set(null);
	}

	/** Signal indicating whether the "Edit Task" overlay is open. */
	isEditTaskOpen = signal(false);

	/**
	 * Opens the edit task overlay.
	 */
	openEditTask() {
		this.isEditTaskOpen.set(true);
	}

	/**
	 * Closes the edit task overlay.
	 */
	closeEditTask() {
		this.isEditTaskOpen.set(false);
	}

	// --- SEARCH & FILTER METHODS ---

	/**
	 * Filters tasks based on the given search term.
	 * Matches titles and descriptions case-insensitively.
	 *
	 * @param term The search term entered by the user.
	 */
	onSearch(term: string) {
		const allTasksFlat = Object.values(this.allTasks).flat() as Task[];

		if (!term) {
			this.filterTasks(allTasksFlat);
			return;
		}

		const lowerTerm = term.toLowerCase();
		const filtered = allTasksFlat.filter(
			(task: Task) =>
				task.title.toLowerCase().includes(lowerTerm) ||
				task.description?.toLowerCase().includes(lowerTerm),
		);

		this.filterTasks(filtered);
	}

	/**
	 * Filters tasks into their respective column signals
	 * (To Do, In Progress, Awaiting Feedback, Done).
	 *
	 * @param tasks The array of tasks to be distributed.
	 */
	filterTasks(tasks: Task[]) {
		this.todoTasks.set(tasks.filter((t) => t.status === "todo"));
		this.inProgressTasks.set(tasks.filter((t) => t.status === "in-progress"));
		this.feedbackTasks.set(tasks.filter((t) => t.status === "awaiting-feedback"));
		this.doneTasks.set(tasks.filter((t) => t.status === "done"));
	}

	// --- ADD TASK OVERLAY ---

	/**
	 * Opens the "Add Task" overlay for a specific category.
	 *
	 * @param category The target task category where the new task should be added.
	 */
	openAddTaskOverlay(category: "todo" | "in-progress" | "awaiting-feedback" | "done") {
		this.addTaskClicked.emit(category);
	}

	/**
	 * Handles quick status changes from the mobile popover menu.
	 *
	 * @param id The ID of the selected task.
	 * @param term The target task status to change to.
	 */
	onPopoverMobileClicked(
		id: string | undefined,
		term: "todo" | "in-progress" | "awaiting-feedback" | "done",
	) {
		if (!id) return;
		this.updateTaskStatus(id, term);
	}
}
