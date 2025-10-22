import { CdkAutofill } from "@angular/cdk/text-field";
import { CommonModule, ViewportScroller } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AddTask } from "@main/add-task/add-task";
import { AddTaskForm } from "@main/add-task/add-task-form/add-task-form";
import { BoardView } from "@main/board/board-view/board-view";

/**
 * Represents the main task board of the application.
 * Handles opening task views, adding tasks, and category selection.
 */
@Component({
	selector: "app-board",
	imports: [CommonModule, BoardView, AddTask, AddTaskForm, CdkAutofill],
	templateUrl: "./board.html",
	styleUrl: "./board.scss",
})
export class Board {
	/**
	 * Flag to track if the detailed task view is open.
	 */
	isTaskViewOpen = false;

	/**
	 * Flag to track if the "Add Task" overlay is open.
	 */
	addTaskOverlayOpen = false;

	/**
	 * The category in which a new task will be added.
	 */
	categoryToAdd: "todo" | "in-progress" | "awaiting-feedback" | "done" = "todo";

	/**
	 * Opens the detailed task view.
	 */
	openTaskView() {
		this.isTaskViewOpen = true;
	}

	/** Angular viewport scroller service, used for scrolling behavior. */
	vps = inject(ViewportScroller);

	/** ActivatedRoute service for route information. */
	route = inject(ActivatedRoute);

	/** Router service for navigation. */
	router = inject(Router);

	/**
	 * Opens the "Add Task" overlay for the given category.
	 * @param category - The category to which the new task will belong.
	 */
	onAddTaskClicked(category: "todo" | "in-progress" | "awaiting-feedback" | "done") {
		this.categoryToAdd = category;
		this.addTaskOverlayOpen = true;
	}

	/**
	 * Closes the "Add Task" overlay when the user cancels adding a task.
	 */
	onCloseAddTask() {
		this.closeAddTask();
	}

	/**
	 * Called after a task is successfully added.
	 * Closes the "Add Task" overlay.
	 */
	onTaskAdded() {
		this.closeAddTask();
	}

	/**
	 * helper to close the "Add Task" overlay.
	 */
	closeAddTask() {
		this.addTaskOverlayOpen = false;
	}
}
