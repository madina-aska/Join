import { inject, Injectable, Injector, OnDestroy, runInInjectionContext } from "@angular/core";
import { DocumentData } from "@angular/fire/compat/firestore";
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  setDoc,
  updateDoc,
} from "@angular/fire/firestore";
import { Task } from "@core/interfaces/task";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

type TaskDictionary = Record<string, Task[]>;

/**
 * Service for managing task operations including Firestore CRUD operations,
 * task organization, and utility functions for task display.
 *
 * This service handles:
 * - Real-time task synchronization with Firestore
 * - Task organization by status and priority
 * - Task creation, update, and deletion
 * - Color generation for task display
 *
 * @example
 * ```typescript
 * // Inject the service
 * private taskService = inject(TaskService);
 *
 * // Access organized tasks
 * const tasks = this.taskService.tasksObject;
 *
 * // Add a new task
 * await this.taskService.addTask(newTask);
 * ```
 */
@Injectable({
	providedIn: "root",
})
export class TaskService implements OnDestroy {
	// Inject Tasks-spezifische Firestore Instanz
	firestore = inject(Firestore, { optional: true }) ?? inject(Firestore);
	injector = inject(Injector);

	// Tasks-spezifische Firestore (falls verfügbar)
	private tasksFirestore = this.getTasksFirestore();

	/** Observable stream of all tasks from Firestore with shared subscription */
	allTasks$!: Observable<Task[]>;

	/** Observable stream of tasks organized by status, derived from allTasks$ */
	tasksObject$!: Observable<TaskDictionary>;

	/**
	 * @deprecated Use tasksObject$ Observable instead
	 * Getter for backward compatibility - returns current snapshot
	 */
	get tasksObject(): TaskDictionary {
		let result: TaskDictionary = {};
		this.tasksObject$
			.pipe()
			.subscribe((val) => (result = val))
			.unsubscribe();
		return result;
	}

	/**
	 * @deprecated Use allTasks$ Observable instead
	 * Getter for backward compatibility - returns current snapshot
	 */
	get allTasks(): Task[] {
		let result: Task[] = [];
		this.allTasks$
			.pipe()
			.subscribe((val) => (result = val))
			.unsubscribe();
		return result;
	}

	constructor() {
		// Initialize Observables
		runInInjectionContext(this.injector, () => {
			const tasksCol = collection(this.tasksFirestore, "tasks");

			// Create shared Observable stream for all tasks
			this.allTasks$ = collectionData(tasksCol, { idField: "id" }).pipe(
				map((rawTasks: any[]) => {
					// Transform raw Firestore data to Task objects
					return rawTasks.map((rawTask) => this.buildDocument(rawTask.id, rawTask));
				}),
				shareReplay(1), // Share one Firestore subscription among all subscribers
			);

			// Derive tasksObject$ from allTasks$
			this.tasksObject$ = this.allTasks$.pipe(map((tasks) => this.createStatusObject(tasks)));
		});
	}

	/**
	 * Gets the Tasks-specific Firestore instance
	 * Falls back to default Firestore if Tasks DB is not available
	 *
	 * Note: Firestore Collections werden automatisch erstellt beim ersten addDoc()
	 * Collections: 'tasks', 'boards', 'categories' werden bei Bedarf angelegt
	 */
	private getTasksFirestore(): Firestore {
		try {
			// Versuche Tasks-spezifische Firestore zu bekommen
			return runInInjectionContext(this.injector, () => {
				return inject(Firestore, { optional: true }) ?? this.firestore;
			});
		} catch {
			// Fallback zu Standard Firestore
			return this.firestore;
		}
	}

	/**
	 * @deprecated Use allTasks$ Observable instead to avoid creating duplicate Firestore listeners.
	 * This method now returns the shared allTasks$ Observable.
	 *
	 * @returns Observable<Task[]> - Stream of all tasks
	 *
	 * @example
	 * ```typescript
	 * // Old way (deprecated)
	 * this.taskService.getTasksAsObject().subscribe(tasks => {
	 *   console.log('All tasks:', tasks);
	 * });
	 *
	 * // New way (recommended)
	 * this.taskService.allTasks$.subscribe(tasks => {
	 *   console.log('All tasks:', tasks);
	 * });
	 * ```
	 */
	getTasksAsObject(): Observable<Task[]> {
		return this.allTasks$;
	}

	private createStatusObject(tasksArr: Task[]): TaskDictionary {
		const tasksObject: TaskDictionary = {
			todo: [],
			"in-progress": [],
			"awaiting-feedback": [],
			done: [],
		};

		tasksArr.forEach((task) => {
			const status = task.status || "todo";
			if (!tasksObject[status]) {
				tasksObject[status] = [];
			}
			tasksObject[status].push(task);
		});

		// Sort by priority within each status
		const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
		Object.keys(tasksObject).forEach((status) => {
			tasksObject[status].sort((a, b) => {
				return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
			});
		});

		return tasksObject;
	}

	private buildDocument(id: string, data: DocumentData): Task {
		return {
			id,
			title: data["title"] || "",
			description: data["description"] || "",
			category: data["category"] || "Technical Task",
			priority: data["priority"] || "medium",
			status: data["status"] || "todo",
			assignedContacts: data["assignedContacts"] || [],
			subtasks: data["subtasks"] || [],
			dueDate: data["dueDate"] || undefined,
			createdAt: data["createdAt"] || undefined,
			updatedAt: data["updatedAt"] || undefined,
			color: data["color"],
		};
	}

	ngOnDestroy() {
		// Cleanup if needed
	}

	/**
	 * Generates the next sequential task ID in format: task-001, task-002, etc.
	 *
	 * @returns Promise that resolves to the next available task ID
	 * @private
	 *
	 * @example
	 * ```typescript
	 * const nextId = await this.generateNextTaskId(); // "task-043"
	 * ```
	 */
	private async generateNextTaskId(): Promise<string> {
		const tasksCol = collection(this.tasksFirestore, "tasks");
		const snapshot = await getDocs(tasksCol);
		let maxNum = 0;

		snapshot.forEach((docSnapshot) => {
			const match = docSnapshot.id.match(/^task-(\d+)$/);
			if (match) {
				maxNum = Math.max(maxNum, parseInt(match[1]));
			}
		});

		return `task-${String(maxNum + 1).padStart(3, "0")}`;
	}

	/**
	 * Adds a new task to Firestore database with custom sequential ID.
	 *
	 * @param task - Task object to add to database
	 * @returns Promise that resolves to the new task's ID (format: task-001)
	 * @throws Error if task creation fails
	 *
	 * @example
	 * ```typescript
	 * const newTask: Task = {
	 *   title: 'Implement user login',
	 *   description: 'Add authentication system',
	 *   category: 'Technical Task',
	 *   priority: 'high',
	 *   status: 'todo'
	 * };
	 * await this.taskService.addTask(newTask);
	 * ```
	 */
	async addTask(task: Task): Promise<string> {
		return await runInInjectionContext(this.injector, async () => {
			const tasksCol = collection(this.tasksFirestore, "tasks");

			try {
				const taskId = await this.generateNextTaskId();

				const now = new Date().toISOString().split("T")[0];
				const taskData = {
					title: task.title,
					description: task.description || "",
					category: task.category,
					priority: task.priority,
					status: task.status || "todo",
					assignedContacts: task.assignedContacts || [],
					subtasks: task.subtasks || [],
					dueDate: task.dueDate || null,
					createdAt: now,
					updatedAt: now,
					color: task.color || this.generateRandomColor(),
				};

				await setDoc(doc(tasksCol, taskId), taskData);

				return taskId;
			} catch (error) {
				console.error("[TaskService] Failed to add task:", error);
				throw error;
			}
		});
	}

	/**
	 * Updates an existing task in Firestore database.
	 *
	 * @param taskId - Firestore document ID of task to update
	 * @param updates - Partial task object with fields to update
	 * @returns Promise that resolves when task is updated
	 * @throws Error if update fails
	 *
	 * @example
	 * ```typescript
	 * await this.taskService.updateTask('task-id-123', {
	 *   status: 'done',
	 *   description: 'Updated description'
	 * });
	 * ```
	 */
	async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
		if (!taskId) return;

		const taskDoc = doc(this.tasksFirestore, "tasks", taskId);
		try {
			await updateDoc(taskDoc, {
				...updates,
				updatedAt: new Date().toISOString().split("T")[0],
			});
		} catch (error) {
			throw new Error("Failed to update task");
		}
	}

	/**
	 * Deletes a task from Firestore database.
	 *
	 * @param taskId - Firestore document ID of task to delete
	 * @returns Promise that resolves when task is deleted
	 * @throws Error if deletion fails or taskId is invalid
	 *
	 * @example
	 * ```typescript
	 * await this.taskService.deleteTask('task-id-123');
	 * ```
	 */
	async deleteTask(taskId: string) {
		if (!taskId) return;

		const taskDoc = doc(this.tasksFirestore, "tasks", taskId);
		try {
			await deleteDoc(taskDoc);
		} catch {
			throw new Error("Failed to delete task");
		}
	}

	/**
	 * Gets the CSS variable for task color based on priority.
	 * Falls back to generated color if none assigned.
	 *
	 * @param task - Task object with color property
	 * @returns CSS variable string for task color
	 *
	 * @example
	 * ```typescript
	 * const taskColor = this.taskService.getTaskColor(task);
	 * // Returns: 'var(--avatar-color-3)'
	 * ```
	 */
	getTaskColor(task: Task): string {
		if (task.color) {
			return `var(--avatar-color-${task.color})`;
		}

		const safeId = task.id || task.title || "X";
		const fallbackIndex = (safeId.charCodeAt(0) % 10) + 1;

		return `var(--avatar-color-${fallbackIndex})`;
	}

	/**
	 * Generates a random color number for task display.
	 *
	 * @returns Random number between 1 and 10
	 */
	private generateRandomColor(): number {
		return Math.floor(Math.random() * 10) + 1;
	}

	/**
	 * Gets tasks filtered by status as Observable.
	 *
	 * @param status - Task status to filter by
	 * @returns Observable stream of tasks with specified status
	 */
	getTasksByStatus(status: Task["status"]): Observable<Task[]> {
		return this.tasksObject$.pipe(map((tasksObj) => tasksObj[status] || []));
	}

	/**
	 * Gets tasks filtered by priority as Observable.
	 *
	 * @param priority - Task priority to filter by
	 * @returns Observable stream of tasks with specified priority
	 */
	getTasksByPriority(priority: Task["priority"]): Observable<Task[]> {
		return this.allTasks$.pipe(map((tasks) => tasks.filter((task) => task.priority === priority)));
	}

	/**
    Toggles the completed status of a subtask within a task
    @param taskId - The ID of the task containing the subtask
    @param subtaskId - The ID of the subtask to toggle
    @returns Promise that resolves when the subtask is updated
    @throws Error if task or subtask is not found*
    @example
    typescriptff
    await this.taskService.toggleSubtask('task-001', 'subtask-1');
  */
	async toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
		if (!taskId || !subtaskId) return;

		try {
			// Get current task from allTasks$ Observable
			const tasks = await new Promise<Task[]>((resolve) => {
				this.allTasks$
					.pipe()
					.subscribe((tasks) => resolve(tasks))
					.unsubscribe();
			});

			const task = tasks.find((t) => t.id === taskId);
			if (!task?.subtasks) {
				throw new Error("Task or subtasks not found");
			}

			// Toggle completed status
			const updatedSubtasks = task.subtasks.map((st) =>
				st.id === subtaskId ? { ...st, completed: !st.completed } : st,
			);

			// Update in Firestore
			await this.updateTask(taskId, { subtasks: updatedSubtasks });
		} catch (error) {
			console.error("[TaskService] Failed to toggle subtask:", error);
			throw error;
		}
	}
}
