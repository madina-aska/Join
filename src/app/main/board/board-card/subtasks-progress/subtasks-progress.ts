import { Component, computed, input } from "@angular/core";
import { ProgressBar } from "@shared/components/progress-bar/progress-bar";

@Component({
	selector: "app-subtasks-progress",
	imports: [ProgressBar],
	templateUrl: "./subtasks-progress.html",
	styleUrl: "./subtasks-progress.scss",
})
export class SubtasksProgress {
	subtasksList = input<any[]>([]);
	subtasksCompleted = computed(() => {
		let completed = 0;
		this.subtasksList().forEach((task) => {
			if (task.complete) {
				completed++;
			}
		});

		console.log(completed);
		return completed;
	});
	subtasksCount = computed(() => this.subtasksList().length);
}
