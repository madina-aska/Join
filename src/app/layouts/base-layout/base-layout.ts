import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { Footer } from "@shared/footer/footer";
import { Header } from "@shared/header/header";

/**
 * Represents the base layout of the application, including the header, footer,
 * and dynamic content rendered via the router outlet.
 */
@Component({
	selector: "app-base-layout",
	imports: [Header, RouterOutlet, Footer],
	templateUrl: "./base-layout.html",
	styleUrl: "./base-layout.scss",
})
export class BaseLayout {
	/**
	 * Indicates whether the user is currently logged in.
	 * This value is updated based on the authentication status.
	 */
	loggedIn = false;

	private authService = inject(AuthService);

	/**
	 * Subscribes to the authentication service to update the `loggedIn` status
	 * whenever the authentication state changes.
	 */
	constructor() {
		this.authService.isLoggedIn$.subscribe((loggedIn) => {
			this.loggedIn = loggedIn;
		});
	}
}
