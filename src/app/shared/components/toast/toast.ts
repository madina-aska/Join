import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	computed,
	signal,
} from "@angular/core";
import { Button } from "@shared/components/button/button";

/**
 * Interface for toast action buttons.
 *
 * @interface ToastAction
 *
 * @example
 * ```typescript
 * const deleteAction: ToastAction = {
 *   label: 'Delete',
 *   handler: () => this.performDelete()
 * };
 * ```
 */
export interface ToastAction {
	/** Text displayed on the action button */
	label: string;

	/** Function called when action button is clicked */
	handler: () => void;
}

/**
 * Toast notification component with animation lifecycle and action support.
 *
 * This component provides animated toast notifications with the following features:
 * - **Smooth animations** with enter/leave transitions (600ms duration)
 * - **Auto-dismiss** with configurable duration
 * - **Action buttons** for interactive notifications
 * - **Multiple toast types** with appropriate styling
 * - **Signal-based state management** for optimal performance
 *
 * Animation Lifecycle:
 * 1. **Enter**: Component mounts with `visible = true`
 * 2. **Display**: Toast is fully visible and interactive
 * 3. **Leave**: `leaving = true` triggers exit animation (600ms)
 * 4. **Hidden**: `visible = false` after animation completes
 *
 * Auto-dismiss Flow:
 * 1. Component initializes with specified duration
 * 2. Timeout starts automatically in ngOnInit
 * 3. After duration expires, close() method is called
 * 4. Animation plays and component emits closeEvent
 *
 * @example
 * ```html
 * <!-- Basic success toast -->
 * <app-toast
 *   type="success"
 *   message="Contact saved successfully"
 *   [duration]="2000"
 *   (closeEvent)="onToastClosed()">
 * </app-toast>
 *
 * <!-- Warning toast with action -->
 * <app-toast
 *   type="warning"
 *   title="Confirm Delete"
 *   message="Delete this contact?"
 *   [action]="deleteAction"
 *   [duration]="0"
 *   (actionEvent)="onActionClicked()">
 * </app-toast>
 * ```
 */
@Component({
	selector: "app-toast",
	imports: [Button],
	templateUrl: "./toast.html",
	styleUrl: "./toast.scss",
})
export class Toast implements OnInit, OnDestroy {
	/** Toast type determining color scheme and default icon */
	@Input() type: "success" | "error" | "warning" | "info" = "success";

	/** Optional title displayed prominently above the message */
	@Input() title?: string;

	/** Main message content of the toast notification */
	@Input() message = "";

	/** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
	@Input() duration = 4000;

	/** Whether to show the X close button in the toast */
	@Input() showCloseButton = true;

	/** Optional custom icon override (falls back to type-based icon) */
	@Input() icon?: string;

	/** Optional action button configuration for interactive toasts */
	@Input() action?: ToastAction;

	/** Optional multiple action buttons for interactive toasts */
	@Input() actions?: ToastAction[];

	/** Emitted when toast is closed (either manually or auto-dismiss) */
	@Output() closeEvent = new EventEmitter<void>();

	/** Emitted when action button is clicked */
	@Output() actionEvent = new EventEmitter<void>();

	/** Signal controlling overall toast visibility in the DOM */
	protected visible = signal(true);

	/** Signal triggering exit animation (toast--leaving CSS class) */
	protected leaving = signal(false);

	/** Timeout ID for auto-dismiss functionality */
	private timeoutId?: number;

	/**
	 * Computed signal generating dynamic CSS classes for toast styling.
	 * Updates automatically based on type and animation state.
	 *
	 * Generated classes:
	 * - `toast`: Base toast styling
	 * - `toast--{type}`: Type-specific colors and icons
	 * - `toast--leaving`: Exit animation trigger (when leaving signal is true)
	 *
	 * @returns Space-separated string of CSS classes for animation and styling
	 */
	protected toastClasses = computed(() => {
		const classes = ["toast"];
		classes.push(`toast--${this.type}`);

		if (this.leaving()) {
			classes.push("toast--leaving");
		}

		return classes.join(" ");
	});

	/**
	 * Angular lifecycle hook that initializes auto-dismiss functionality.
	 * Sets up timeout for automatic toast dismissal if duration > 0.
	 *
	 * Animation Flow:
	 * 1. Component mounts with visible = true (enter animation)
	 * 2. Timeout starts if duration is specified
	 * 3. After timeout, close() method triggers exit animation
	 *
	 * @example
	 * ```typescript
	 * // Toast with 3-second auto-dismiss
	 * <app-toast [duration]="3000" message="Auto-dismiss toast">
	 *
	 * // Persistent toast (no auto-dismiss)
	 * <app-toast [duration]="0" message="Manual dismiss only">
	 * ```
	 */
	ngOnInit(): void {
		// Auto-dismiss after duration (if > 0)
		if (this.duration > 0) {
			this.timeoutId = window.setTimeout(() => {
				this.close();
			}, this.duration);
		}
	}

	/**
	 * Angular lifecycle hook that cleans up resources.
	 * Clears auto-dismiss timeout to prevent memory leaks.
	 *
	 * @example
	 * ```typescript
	 * // Called automatically when component is destroyed
	 * // Prevents timeout from firing after component removal
	 * ```
	 */
	ngOnDestroy(): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
	}

	/**
	 * Initiates the toast closing sequence with smooth exit animation.
	 *
	 * Animation Sequence:
	 * 1. **Trigger Exit**: Sets leaving = true (adds toast--leaving CSS class)
	 * 2. **Animation Duration**: Waits 600ms for CSS animation to complete
	 * 3. **Hide & Emit**: Sets visible = false and emits closeEvent
	 *
	 * The 600ms timeout matches the CSS transition duration for smooth UX.
	 *
	 * @example
	 * ```typescript
	 * // Manual close (e.g., from close button)
	 * this.close();
	 *
	 * // Automatic close (from timeout)
	 * setTimeout(() => this.close(), this.duration);
	 * ```
	 */
	close(): void {
		this.leaving.set(true);

		// Wait for animation to complete before hiding
		setTimeout(() => {
			this.visible.set(false);
			this.closeEvent.emit();
		}, 600); // Animation duration
	}

	/**
	 * Handles action button clicks in interactive toasts.
	 * Calls the action handler and emits actionEvent for parent components.
	 *
	 * @example
	 * ```typescript
	 * // In template: action button calls this method
	 * // Parent component can listen via (actionEvent)
	 *
	 * // Action definition:
	 * const confirmAction = {
	 *   label: 'Confirm',
	 *   handler: () => this.performAction()
	 * };
	 * ```
	 */
	handleAction(): void {
		if (this.action) {
			this.action.handler();
			this.actionEvent.emit();
		}
	}

	/**
	 * Handles multiple action button clicks in interactive toasts.
	 * Calls the specific action handler and emits actionEvent.
	 * For "Cancel" actions, also triggers the closing animation.
	 *
	 * @param actionToHandle - The specific action to execute
	 */
	handleMultipleAction(actionToHandle: ToastAction): void {
		actionToHandle.handler();
		this.actionEvent.emit();

		// If this is a cancel action, trigger the closing animation
		if (actionToHandle.label.toLowerCase() === "cancel") {
			this.close();
		}
	}

	/**
	 * Immediately shows the toast without animation.
	 * Typically used when programmatically controlling toast visibility.
	 *
	 * @example
	 * ```typescript
	 * // For manual control (bypasses normal animation flow)
	 * this.toastRef.show();
	 * ```
	 */
	show(): void {
		this.visible.set(true);
	}

	/**
	 * Immediately hides the toast without animation.
	 * For instant dismissal without the usual exit animation.
	 *
	 * @example
	 * ```typescript
	 * // For emergency dismissal or cleanup
	 * this.toastRef.hide();
	 * ```
	 */
	hide(): void {
		this.visible.set(false);
	}
}
