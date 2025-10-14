import { Component, inject } from "@angular/core";
import { CommonModule, AsyncPipe, DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { map, combineLatest } from "rxjs";
import { TaskService } from "@core/services/task-service";
import { Task } from "@core/interfaces/task";

@Component({
	selector: "app-dashboard",
	imports: [CommonModule, AsyncPipe, DatePipe],
	templateUrl: "./dashboard.html",
	styleUrl: "./dashboard.scss",
})
export class Dashboard {
	isTodoHovered = false;
	isDoneHovered = false;

	taskService = inject(TaskService);
	router = inject(Router);

	counts$ = combineLatest([this.taskService.tasksObject$, this.taskService.allTasks$]).pipe(
		map(([tasksObj, allTasks]) => {
			const now = Date.now();
			const ms48 = 48 * 60 * 60 * 1000; // 48 hours in milliseconds (used to check for upcoming deadlines)

			// Count the number of tasks in each category (fallback to empty array if undefined)
			const todo = (tasksObj["todo"] || []).length;
			const done = (tasksObj["done"] || []).length;
			const inProgress = (tasksObj["in-progress"] || []).length;
			const awaitingFeedback = (tasksObj["awaiting-feedback"] || []).length;

			// Total number of tasks in the board
			const inBoard = allTasks.length;

			// Count how many tasks are "urgent"
			const urgent = allTasks.filter((t: Task) => {
				if (t.priority === "urgent") return true;

				// Otherwise, check if the due date is within 48 hours
				if (t.dueDate) {
					const due = new Date(t.dueDate).getTime();
					const diff = due - now;
					return diff >= 0 && diff <= ms48;
				}
				return false;
			}).length;

			// Return an object with all task counts
			return { todo, done, urgent, inBoard, inProgress, awaitingFeedback };
		}),
	);

	/** next deadline are being updated auto. */
	nextDeadline$ = this.taskService.allTasks$.pipe(
		map((tasks) => {
			const upcoming = tasks
				.filter((t) => t.dueDate && t.status !== "done") // exclude completed tasks
				.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
			return upcoming[0]?.dueDate ?? null;
		}),
	);

	openBoard() {
		this.router.navigateByUrl("/board");
	}
}
