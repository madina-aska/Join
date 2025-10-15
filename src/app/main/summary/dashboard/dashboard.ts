import { Component, inject } from "@angular/core";
import { CommonModule, AsyncPipe, DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { map, combineLatest } from "rxjs";
import { TaskService } from "@core/services/task-service";

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
