import { Component, input } from "@angular/core";

function nonNegative(number: number): number {
	return Math.max(0, number);
}

@Component({
	selector: "app-progress-bar",
	imports: [],
	templateUrl: "./progress-bar.html",
	styleUrl: "./progress-bar.scss",
})
export class ProgressBar {
	max = input(0, { transform: nonNegative });
	current = input(0, { transform: nonNegative });

	getProgress() {
		const max = this.max();
		let current = this.current();

		if (max < current) current = max;

		const progress = Math.ceil((current / max) * 100);
		return progress;
	}
}
