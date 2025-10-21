import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { AuthService } from "@core/services/auth-service";

@Component({
	selector: "app-greeting",
	imports: [CommonModule],
	templateUrl: "./greeting.html",
	styleUrl: "./greeting.scss",
})
export class Greeting {
	/**
	 * Service responsible for authentication and user session management.
	 * Injected using Angular's `inject()` function.
	 * @type {AuthService}
	 */
	authService = inject(AuthService);

	/**
	 * A reactive signal storing the display name of the current user.
	 * Defaults to "Guest" if no user is logged in.
	 * @type {import('@angular/core').WritableSignal<string>}
	 */
	userName = signal<string>("");

	/**
	 * The current hour in 24-hour format.
	 * @type {number}
	 */
	hour = new Date().getHours();

	/**
	 * A dynamic greeting message based on the current hour:
	 * - "Good morning" before 12:00
	 * - "Good afternoon" before 18:00
	 * - "Good evening" otherwise
	 * @type {string}
	 */
	greeting = this.hour < 12 ? "Good morning" : this.hour < 18 ? "Good afternoon" : "Good evening";

	/**
	 * Subscribes to the `AuthService` to update the user name reactively
	 * whenever the login state changes.
	 */
	constructor() {
		this.authService.userLoggedIn$.subscribe((user) => {
			this.userName.set(user?.displayName || "Guest");
		});
	}
}
