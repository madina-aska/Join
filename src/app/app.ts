import { Component, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Footer } from "./shared/footer/footer";
import { Header } from "./shared/header/header";
import { Toast } from "./shared/components/toast/toast";
import { ToastService } from "./shared/services/toast.service";

/**
 * Root application component that orchestrates the main layout and global features.
 *
 * This component serves as the application shell and provides:
 * - **Main Layout Structure**: Header, content area (router-outlet), and footer
 * - **Global Toast Integration**: Centralized toast notification system
 * - **Application Title Management**: Signal-based title state
 * - **Route-based Content**: Dynamic content rendering via Angular Router
 *
 * Architecture:
 * - Header: Application navigation and branding
 * - RouterOutlet: Dynamic page content based on current route
 * - Footer: Navigation controls and page state
 * - Toast: Global notification overlay system
 *
 * Toast Integration:
 * - Subscribes to ToastService for application-wide notifications
 * - Handles toast action button interactions
 * - Manages toast lifecycle and user interactions
 *
 * @example
 * ```html
 * <!-- Rendered as the application root -->
 * <app-root></app-root>
 *
 * <!-- Internal structure -->
 * <app-header [profile]="userProfile"></app-header>
 * <main>
 *   <router-outlet></router-outlet>
 * </main>
 * <app-footer></app-footer>
 * <app-toast [config]="currentToast()"></app-toast>
 * ```
 */
@Component({
	selector: "app-root",
	imports: [RouterOutlet, Header, Footer, Toast],
	templateUrl: "./app.html",
	styleUrl: "./app.scss",
})
export class App {
	/** Application title signal for branding and SEO */
	protected readonly title = signal("join");

	/** Injected toast service for global notification management */
	protected toastService = inject(ToastService);

	/** Current toast state from ToastService for template binding */
	protected currentToast = this.toastService.toast;

	/**
	 * Handles action button clicks from toast notifications.
	 * Executes the action handler if a toast with action is currently active.
	 *
	 * @example
	 * ```html
	 * <!-- Called automatically from toast action buttons -->
	 * <app-toast (actionEvent)="handleToastAction()"></app-toast>
	 * ```
	 */
	protected handleToastAction(): void {
		const toast = this.currentToast();
		if (toast?.action) {
			toast.action.handler();
		}
	}
}
