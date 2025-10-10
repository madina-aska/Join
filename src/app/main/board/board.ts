import { CdkAutofill } from "@angular/cdk/text-field";
import { CommonModule, ViewportScroller } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AddTask } from "@main/add-task/add-task";
import { AddTaskForm } from "@main/add-task/add-task-form/add-task-form";
import { BoardView } from "@main/board/board-view/board-view";

@Component({
	selector: "app-board",
	imports: [CommonModule, BoardView, AddTask, AddTaskForm, CdkAutofill],
	templateUrl: "./board.html",
	styleUrl: "./board.scss",
})
export class Board {
	isTaskViewOpen = false;
	addTaskOverlayOpen = false;
	categoryToAdd: "todo" | "in-progress" | "awaiting-feedback" | "done" = "todo";

	openTaskView() {
		this.isTaskViewOpen = true;
	}

	vps = inject(ViewportScroller);
	route = inject(ActivatedRoute);
	router = inject(Router);

	onAddTaskClicked(category: "todo" | "in-progress" | "awaiting-feedback" | "done") {
		this.categoryToAdd = category;
		this.addTaskOverlayOpen = true;
	}

	onCloseAddTask() {
		this.closeAddTask();
	}

	onTaskAdded() {
		this.closeAddTask();
	}

	private closeAddTask() {
		this.addTaskOverlayOpen = false;
	}
}
