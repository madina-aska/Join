import { inject, Injectable, Injector, OnDestroy, runInInjectionContext } from "@angular/core";
import { DocumentData } from "@angular/fire/compat/firestore";
import {
	addDoc,
	collection,
	collectionData,
	deleteDoc,
	doc,
	Firestore,
	getDocs,
	onSnapshot,
	QuerySnapshot,
	setDoc,
	updateDoc,
} from "@angular/fire/firestore";
import { Task } from "@core/interfaces/task";

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

	/** Currently selected task for detailed view */
	taskForView: Task | undefined;

	/** Dictionary of tasks organized by status */
	tasksObject: TaskDictionary = {};

	/** All tasks as flat array */
	allTasks: Task[] = [];

	/** Cleanup function for tasks collection subscription */
	unsubscribeTasksObject: (() => void) | null = null;

	/** Cleanup function for single task subscription */
	unsubscribeTaskForView: (() => void) | null = null;

	constructor() {
		console.log('[TaskService] Service initialized');
		console.log('[TaskService] Firestore instance:', this.tasksFirestore);
		this.getTasksAsObject();
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
	 * Establishes real-time subscription to all tasks in Firestore.
	 * Automatically organizes tasks by status and updates tasksObject.
	 *
	 * @returns Observable data stream from Firestore collection
	 *
	 * @example
	 * ```typescript
	 * // Called automatically in constructor
	 * // Access organized tasks via this.tasksObject
	 * ```
	 */
	getTasksAsObject() {
		console.log('[TaskService] Initializing real-time tasks subscription...');

		let data;
		runInInjectionContext(this.injector, () => {
			const tasksCol = collection(this.tasksFirestore, "tasks");
			console.log('[TaskService] Connected to Firestore collection:', tasksCol);

			this.unsubscribeTasksObject = onSnapshot(
				tasksCol,
				(snapshot: QuerySnapshot<DocumentData>) => {
					console.log('[TaskService] Received Firestore snapshot update');
					console.log('[TaskService] Snapshot size:', snapshot.size);
					console.log('[TaskService] Snapshot empty:', snapshot.empty);

					this.tasksObject = {};
					this.allTasks = [];

					const tasks: Task[] = [];

					snapshot.forEach((doc) => {
						const task = this.buildDocument(doc.id, doc.data());
						tasks.push(task);
						this.allTasks.push(task);
						console.log('[TaskService] Processed task:', {
							id: doc.id,
							title: task.title,
							status: task.status,
							subtasks: task.subtasks?.length || 0
						});
					});

					this.createStatusObject(tasks);

					console.log('[TaskService] Tasks organized by status:', {
						todo: this.tasksObject['todo']?.length || 0,
						inprogress: this.tasksObject['inprogress']?.length || 0,
						awaitingfeedback: this.tasksObject['awaitingfeedback']?.length || 0,
						done: this.tasksObject['done']?.length || 0,
						total: tasks.length
					});
				},
				(error) => {
					console.error('[TaskService] Firestore snapshot error:', error);
					console.error('[TaskService] Error details:', {
						message: error.message,
						code: error.code
					});
				}
			);
			data = collectionData(tasksCol, { idField: "id" });
		});
		return data;
	}

	/**
	 * Subscribes to a specific task document by ID for real-time updates.
	 * Updates taskForView property with the latest task data.
	 *
	 * @param taskId - Firestore document ID of the task
	 *
	 * @example
	 * ```typescript
	 * this.taskService.getDocumentById('task-id-123');
	 * // Access task via this.taskService.taskForView
	 * ```
	 */
	getDocumentById(taskId: string) {
		runInInjectionContext(this.injector, () => {
			const task = doc(this.tasksFirestore, "tasks", taskId);
			this.unsubscribeTaskForView = onSnapshot(task, (snapshot) => {
				this.taskForView = undefined;
				if (snapshot.exists()) {
					setTimeout(() => {
						this.taskForView = this.buildDocument(snapshot.id, snapshot.data());
					}, 0);
				}
			});
		});
	}

	private createStatusObject(tasksArr: Task[]) {
		this.tasksObject = {
			todo: [],
			"in-progress": [],
			done: [],
		};

		tasksArr.forEach((task) => {
			const status = task.status || "todo";
			if (!this.tasksObject[status]) {
				this.tasksObject[status] = [];
			}
			this.tasksObject[status].push(task);
		});

		// Sort by priority within each status
		Object.keys(this.tasksObject).forEach((status) => {
			this.tasksObject[status].sort((a, b) => {
				const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
				return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
			});
		});
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
			dueDate: data["dueDate"]?.toDate() || undefined,
			createdAt: data["createdAt"]?.toDate() || undefined,
			updatedAt: data["updatedAt"]?.toDate() || undefined,
			color: data["color"],
		};
	}

	ngOnDestroy() {
		this.unsubscribeTaskForView?.();
		this.unsubscribeTasksObject?.();
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

		return `task-${String(maxNum + 1).padStart(3, '0')}`;
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
		console.log('[TaskService] Adding new task:', {
			title: task.title,
			category: task.category,
			priority: task.priority,
			status: task.status || "todo"
		});

		return await runInInjectionContext(this.injector, async () => {
			const tasksCol = collection(this.tasksFirestore, "tasks");
			console.log('[TaskService] Using Firestore collection:', tasksCol);

			try {
				const taskId = await this.generateNextTaskId();
				console.log('[TaskService] Generated task ID:', taskId);

				const now = new Date();
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

				console.log('[TaskService] Task data being saved:', taskData);

				await setDoc(doc(tasksCol, taskId), taskData);

				console.log('[TaskService] Task successfully added with ID:', taskId);

				return taskId;
			} catch (error) {
				console.error('[TaskService] Failed to add task:', error);
				console.error('[TaskService] Error details:', {
					message: error instanceof Error ? error.message : 'Unknown error',
					code: error && typeof error === 'object' && 'code' in error ? (error as any).code : 'UNKNOWN',
					task: task
				});
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
				updatedAt: new Date(),
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
	 * Gets tasks filtered by status.
	 *
	 * @param status - Task status to filter by
	 * @returns Array of tasks with specified status
	 */
	getTasksByStatus(status: Task["status"]): Task[] {
		return this.tasksObject[status] || [];
	}

	/**
	 * Gets tasks filtered by priority.
	 *
	 * @param priority - Task priority to filter by
	 * @returns Array of tasks with specified priority
	 */
	getTasksByPriority(priority: Task["priority"]): Task[] {
		return this.allTasks.filter((task) => task.priority === priority);
	}
}