import { Component, computed, input } from "@angular/core";
import { ProgressBar } from "@shared/components/progress-bar/progress-bar";

/**
 * Component that displays the progress of a list of subtasks.
 *
 * It uses a progress bar to visualize the number of completed subtasks
 * relative to the total number of subtasks.
 *
 * @example
 * ```html
 * <app-subtasks-progress [subtasksList]="tasks"></app-subtasks-progress>
 * ```
 */
@Component({
	selector: "app-subtasks-progress",
	imports: [ProgressBar],
	templateUrl: "./subtasks-progress.html",
	styleUrl: "./subtasks-progress.scss",
})
export class SubtasksProgress {
	/**
	 * Input property containing an array of subtasks.
	 * Each subtask object should have a `complete` boolean property.
	 */
	subtasksList = input<any[]>([]);

	/**
	 * Computed property that returns the number of completed subtasks.
	 *
	 * @returns Number of subtasks where `complete` is true
	 *
	 * @example
	 * ```ts
	 * const completed = this.subtasksCompleted();
	 * console.log(`Completed ${completed} subtasks`);
	 * ```
	 */
	subtasksCompleted = computed(() => {
		let completed = 0;
		this.subtasksList().forEach((task) => {
			if (task.complete) {
				completed++;
			}
		});

		return completed;
	});

	/**
	 * Computed property that returns the total number of subtasks.
	 *
	 * @returns Total number of subtasks in the `subtasksList`
	 *
	 * @example
	 * ```ts
	 * const total = this.subtasksCount();
	 * console.log(`Total subtasks: ${total}`);
	 * ```
	 */
	subtasksCount = computed(() => this.subtasksList().length);
}
