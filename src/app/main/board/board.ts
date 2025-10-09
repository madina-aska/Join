import { CdkAutofill } from "@angular/cdk/text-field";
import { CommonModule, ViewportScroller } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AddTask } from "@main/add-task/add-task";
import { AddTaskForm } from "@main/add-task/add-task-form/add-task-form";
import { BoardView } from "./board-view/board-view";

@Component({
	selector: "app-board",
	imports: [CommonModule, BoardView, AddTask, AddTaskForm, CdkAutofill],
	templateUrl: "./board.html",
	styleUrl: "./board.scss",
})
export class Board {
	isTaskViewOpen = false;
	addTaskOverlayOpen = false;

	openTaskView() {
		this.isTaskViewOpen = true;
	}

	vps = inject(ViewportScroller);
	route = inject(ActivatedRoute);
	router = inject(Router);

	onAddTaskClicked() {
		this.addTaskOverlayOpen = true;
	}

	onCloseAddTask() {
		this.addTaskOverlayOpen = false;
	}
}
