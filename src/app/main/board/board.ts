import { Component } from "@angular/core";
import { EditTask } from "./edit-task/edit-task";
import { TaskView } from "./task-view/task-view";

@Component({
	selector: "app-board",
	imports: [TaskView, EditTask],
	templateUrl: "./board.html",
	styleUrl: "./board.scss",
})
export class Board {
	isTaskViewOpen = false;
	openTaskView() {
		this.isTaskViewOpen = true;
	}

	closeTaskView() {
		this.isTaskViewOpen = false;
	}

	isEditTaskOpen = false;

	openEditTask() {
		this.isEditTaskOpen = true;
	}

	closeEditTask() {
		this.isEditTaskOpen = false;
	}
}
