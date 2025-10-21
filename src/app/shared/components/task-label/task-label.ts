import { Component, computed, input } from "@angular/core";

/**
 * Displays a task label based on the provided category.
 * Transforms the category into a clean, lowercase, hyphen-free string for consistent styling.
 *
 * @example
 * ```html
 * <app-task-label [category]="'User Story'"></app-task-label>
 * ```
 */
@Component({
	selector: "app-task-label",
	imports: [],
	templateUrl: "./task-label.html",
	styleUrls: ["./task-label.scss"],
})
export class TaskLabel {
	/** The category name of the task */
	category = input<string>("");

	/** Computed property: cleans and formats the category string */
	readonly categoryClean = computed(() =>
		this.category().toLowerCase().trim().replace(/[- ]/g, ""),
	);

	/** List of predefined task categories */
	categories = [
		{ value: "User Story", name: "userstory" },
		{ value: "Technical Task", name: "technicaltask" },
	];
}
