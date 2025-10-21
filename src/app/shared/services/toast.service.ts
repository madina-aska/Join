import { Injectable, signal } from "@angular/core";
import { ToastAction } from "@shared/components/toast/toast";

/**
 * Defines the configuration for a toast notification.
 */
export interface ToastConfig {
	/** Toast type determining color scheme and icon. */
	type: "success" | "error" | "warning" | "info";

	/** Optional title displayed at the top of the toast. */
	title?: string;

	/** Main message text of the toast. */
	message: string;

	/** Duration in milliseconds before auto-hide. */
	duration?: number;

	/** Optional custom icon (defaults to icon based on type). */
	icon?: string;

	/** If true, prevents auto-hide and requires manual dismissal. */
	persistent?: boolean;

	/** Single action button with label and handler. */
	action?: ToastAction;

	/** Multiple action buttons with labels and handlers. */
	actions?: ToastAction[];
}

/**
 * Service for managing and displaying toast notifications.
 *
 * Provides utility methods to show success, error, warning, and info toasts.
 * Uses Angular signals for reactive UI updates and supports action buttons.
 */
@Injectable({ providedIn: "root" })
export class ToastService {
	/** Holds the current active toast configuration. */
	protected currentToast = signal<ToastConfig | null>(null);

	/**
	 * Exposes a read-only signal for the current toast state.
	 * Components can subscribe to this to display toasts reactively.
	 */
	get toast() {
		return this.currentToast.asReadonly();
	}

	/** Shows a success toast with short duration. */
	showSuccess(message: string, title?: string): void {
		this.show({ type: "success", message, title, duration: 1500 });
	}

	/** Shows an error toast with longer duration. */
	showError(message: string, title?: string): void {
		this.show({ type: "error", message, title, duration: 5000 });
	}

	/** Shows a warning toast. */
	showWarning(message: string, title?: string): void {
		this.show({ type: "warning", message, title, duration: 4000 });
	}

	/** Shows a warning toast with a single interactive action. */
	showWarningWithAction(message: string, action: ToastAction, title?: string): void {
		this.show({ type: "warning", message, title, action, duration: 5000 });
	}

	/** Shows a warning toast with multiple action buttons. */
	showWarningWithActions(message: string, actions: ToastAction[], title?: string): void {
		this.show({ type: "warning", message, title, actions, duration: 5000 });
	}

	/** Shows an informational toast. */
	showInfo(message: string, title?: string): void {
		this.show({ type: "info", message, title, duration: 4000 });
	}

	/**
	 * Displays a toast with custom configuration.
	 *
	 * @param config - Toast configuration object.
	 */
	show(config: ToastConfig): void {
		this.currentToast.set(config);
	}

	/** Hides the currently visible toast. */
	hide(): void {
		this.currentToast.set(null);
	}
}
