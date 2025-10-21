import { Component, inject } from "@angular/core";
import { CommonModule, AsyncPipe, DatePipe } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { map, combineLatest } from "rxjs";
import { TaskService } from "@core/services/task-service";

@Component({
	selector: "app-dashboard",
	imports: [CommonModule, AsyncPipe, DatePipe, RouterModule],
	templateUrl: "./dashboard.html",
	styleUrl: "./dashboard.scss",
})
export class Dashboard {
	/**
	 * Indicates whether the "To-do" section is currently hovered.
	 * Used for hover effects in the template.
	 * @type {boolean}
	 */
	isTodoHovered = false;

	/**
	 * Indicates whether the "Done" section is currently hovered.
	 * Used for hover effects in the template.
	 * @type {boolean}
	 */
	isDoneHovered = false;

	/**
	 * Provides task-related data and helper methods.
	 * Injected via Angular's dependency injection.
	 * @type {TaskService}
	 */
	taskService = inject(TaskService);

	/**
	 * Angular Router instance for navigating between views.
	 * @type {Router}
	 */
	router = inject(Router);

	/**
	 * An observable that emits the current task counts and summary statistics.
	 * Combines multiple task streams and maps them into a single object containing:
	 *  - `todo`: number of tasks to do
	 *  - `done`: number of completed tasks
	 *  - `inProgress`: number of tasks in progress
	 *  - `awaitingFeedback`: number of tasks awaiting feedback
	 *  - `inBoard`: total number of tasks
	 *  - `urgent`: number of urgent tasks
	 *
	 * @type {import('rxjs').Observable<{
	 *   todo: number,
	 *   done: number,
	 *   urgent: number,
	 *   inBoard: number,
	 *   inProgress: number,
	 *   awaitingFeedback: number
	 * }>}
	 */
	counts$ = combineLatest([
		this.taskService.tasksObject$,
		this.taskService.allTasks$,
		this.taskService.getTasksByPriority("urgent"),
	]).pipe(
		map(([tasksObj, allTasks, urgentTasks]) => {
			const todo = (tasksObj["todo"] || []).length;
			const done = (tasksObj["done"] || []).length;
			const inProgress = (tasksObj["in-progress"] || []).length;
			const awaitingFeedback = (tasksObj["awaiting-feedback"] || []).length;
			const inBoard = allTasks.length;

			const urgent = urgentTasks.length;

			return { todo, done, urgent, inBoard, inProgress, awaitingFeedback };
		}),
	);

	/**
	 * An observable that emits the date of the next upcoming task deadline,
	 * excluding tasks marked as "done". Returns `null` if there are no upcoming tasks.
	 *
	 * @type {import('rxjs').Observable<string | null>}
	 */
	nextDeadline$ = this.taskService.allTasks$.pipe(
		map((tasks) => {
			const upcoming = tasks
				.filter((t) => t.dueDate && t.status !== "done")
				.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
			return upcoming[0]?.dueDate ?? null;
		}),
	);
}
