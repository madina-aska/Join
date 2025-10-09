import { Component, input } from "@angular/core";
import { AddTaskForm } from "@main/add-task/add-task-form/add-task-form";

@Component({
	selector: "app-add-task",
	imports: [AddTaskForm, AddTaskForm],
	templateUrl: "./add-task.html",
	styleUrl: "./add-task.scss",
})
export class AddTask {
	categoryToAdd = input<"todo" | "in-progress" | "awaiting-feedback" | "done">("todo");
}
