import { Location } from "@angular/common";
import { Component, inject } from "@angular/core";

/**
 * Displays the help or information page of the application.
 *
 * This component provides users with guidance, FAQs, or other informational content.
 * It utilizes Angular's Location service to manage navigation and route state.
 *
 * @example
 * ```html
 * <app-help></app-help>
 * ```
 */
@Component({
	selector: "app-help",
	imports: [],
	templateUrl: "./help.html",
	styleUrl: "./help.scss",
})
export class Help {
	/**
	 * Injected Angular Location service for navigation and route state management.
	 *
	 * @remarks
	 * The Location service allows the component to interact with the browser's URL
	 * and manage navigation within the application.
	 */
	location = inject(Location);
}
