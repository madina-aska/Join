import { CommonModule } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

/**
 * Footer navigation component that manages persistent navigation state.
 *
 * This component provides the application's main footer navigation and
 * automatically remembers and restores the last visited page using `localStorage`.
 * It also integrates with Angular's router to track active routes and update
 * the UI accordingly.
 *
 * **Key Features:**
 * - Persistent active page state via `localStorage`
 * - Automatic navigation restoration on app reload
 * - Reactive highlighting of the active navigation link
 * - Router event monitoring for state synchronization
 *
 * **Supported Routes:**
 * - `summary` — Dashboard overview
 * - `board` — Task board
 * - `add-task` — Task creation
 * - `contacts` — Contact management
 *
 * @example
 * ```html
 * <app-footer></app-footer>
 *
 * <!-- Active page highlighting -->
 * <a routerLink="/summary" [class.active]="isActive('summary')">Summary</a>
 * <a routerLink="/contacts" [class.active]="isActive('contacts')">Contacts</a>
 * ```
 */
@Component({
	selector: "app-footer",
	templateUrl: "./footer.html",
	styleUrls: ["./footer.scss"],
	standalone: true,
	imports: [CommonModule, RouterModule],
})
export class Footer {
	/** Name of the currently active page for visual highlighting and state persistence. */
	activePage = "summary";

	/** Indicates whether a user is currently logged in. */
	loggedIn = input<boolean>(false);

	/** Angular Router instance for navigation and route monitoring. */
	private router = inject(Router);

	/**
	 * Checks whether the specified page is currently active.
	 *
	 * Used in the template to determine which navigation link
	 * should be visually marked as active.
	 *
	 * @param page - The page name to check.
	 * @returns `true` if the given page is the current active route.
	 *
	 * @example
	 * ```html
	 * <a routerLink="/board" [class.active]="isActive('board')">Board</a>
	 * ```
	 */
	isActive(page: string): boolean {
		const activePage = this.router.url;
		const cleanPath = this.getCleanPath(activePage);
		return cleanPath === page;
	}

	/**
	 * Extracts the base path of a route without query parameters.
	 *
	 * @param page - Full route including optional query parameters.
	 * @returns The cleaned path segment (e.g., `"summary"` from `"/summary?id=123"`).
	 */
	getCleanPath(page: string): string {
		const urlTree = this.router.parseUrl(page);
		return urlTree.root.children["primary"]?.segments[0].toString();
	}
}
