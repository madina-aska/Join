import { Component, input } from "@angular/core";
import { AddTaskForm } from "@main/add-task/add-task-form/add-task-form";

/**
 * Parent component for adding a new task.
 *
 * This component wraps the `AddTaskForm` child component and
 * provides the `categoryToAdd` input to specify which board
 * category the task should be added to (e.g., "todo", "in-progress").
 */
@Component({
	selector: "app-add-task",
	imports: [AddTaskForm, AddTaskForm],
	templateUrl: "./add-task.html",
	styleUrl: "./add-task.scss",
})
export class AddTask {
	/**
	 * The category in which the new task should be added.
	 * Passed as input to the `AddTaskForm` child component.
	 * @type {import('@angular/core').InputSignal<"todo" | "in-progress" | "awaiting-feedback" | "done">}
	 */
	categoryToAdd = input<"todo" | "in-progress" | "awaiting-feedback" | "done">("todo");
}
