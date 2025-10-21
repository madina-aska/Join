import { Component, input } from "@angular/core";

/**
 * Ensures the provided number is non-negative.
 * Returns the larger of 0 or the given number.
 *
 * @param number The number to check.
 * @returns The input number if it's non-negative; otherwise, 0.
 */
function nonNegative(number: number): number {
	return Math.max(0, number);
}

/**
 * Displays a progress bar indicating the completion percentage.
 *
 * Utilizes Angular's latest input signals and supports responsive design.
 *
 * @example
 * ```html
 * <app-progress-bar [max]="100" [current]="currentValue"></app-progress-bar>
 * ```
 */
@Component({
	selector: "app-progress-bar",
	imports: [],
	templateUrl: "./progress-bar.html",
	styleUrls: ["./progress-bar.scss"],
})
export class ProgressBar {
	/** Maximum value representing the total progress */
	max = input(0, { transform: nonNegative });

	/** Current value representing the completed progress */
	current = input(0, { transform: nonNegative });

	/**
	 * Calculates the progress percentage.
	 *
	 * Ensures that the current value does not exceed the maximum value.
	 * Returns a value between 0 and 100 representing the completion percentage.
	 */
	getProgress() {
		const max = this.max();
		let current = this.current();

		if (max < current) current = max;

		const progress = Math.ceil((current / max) * 100);
		return progress;
	}
}
