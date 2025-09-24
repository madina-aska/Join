import { Component, computed, EventEmitter, Input, Output } from "@angular/core";

/**
 * Reusable button component with multiple variants, sizes, and states.
 *
 * This component provides a comprehensive button solution with:
 * - **Multiple variants** for different use cases (primary, secondary, fab, etc.)
 * - **Size options** for responsive design (small, medium, large)
 * - **Icon support** with optional alternative text
 * - **Loading and disabled states** with proper accessibility
 * - **Event handling** for click, double-click, and mouse events
 * - **Dynamic styling** using computed signals for optimal performance
 *
 * Variants:
 * - `primary`: Main call-to-action buttons (blue)
 * - `secondary`: Secondary actions (gray)
 * - `fab`: Floating action button (circular)
 * - `edit`: Edit actions (blue with edit styling)
 * - `delete`: Destructive actions (red)
 * - `success`: Success actions (green)
 * - `cancel`: Cancel actions (light gray)
 * - `ghost`: Transparent background with border
 *
 * @example
 * ```html
 * <!-- Primary button with icon -->
 * <app-button
 *   variant="primary"
 *   icon="save"
 *   (clickEvent)="onSave()">
 *   Save Contact
 * </app-button>
 *
 * <!-- FAB button -->
 * <app-button
 *   variant="fab"
 *   icon="add"
 *   size="large"
 *   (clickEvent)="openAddDialog()">
 * </app-button>
 *
 * <!-- Loading state -->
 * <app-button
 *   variant="success"
 *   [loading]="isSubmitting"
 *   [disabled]="isSubmitting">
 *   Submit
 * </app-button>
 * ```
 */
@Component({
	selector: "app-button",
	imports: [],
	templateUrl: "./button.html",
	styleUrl: "./button.scss",
})
export class Button {
	/** Button style variant determining color scheme and visual appearance */
	@Input() variant:
		| "primary"
		| "fab"
		| "secondary"
		| "edit"
		| "delete"
		| "success"
		| "cancel"
		| "ghost" = "primary";

	/** Button size affecting padding and typography scale */
	@Input() size: "small" | "medium" | "large" = "medium";

	/** Optional icon name to display inside the button */
	@Input() icon?: string;

	/** Alternative text for the icon for accessibility */
	@Input() iconAlt?: string;

	/** Shows loading spinner and prevents interactions when true */
	@Input() loading = false;

	/** Disables button interactions and applies disabled styling */
	@Input() disabled = false;

	/** HTML button type attribute for form behavior */
	@Input() type: "button" | "submit" | "reset" = "button";

	/** Makes button span full width of its container */
	@Input() fullWidth = false;

	/** Emitted when button is clicked (respects disabled/loading state) */
	@Output() clickEvent = new EventEmitter<MouseEvent>();

	/** Emitted when button is double-clicked (respects disabled/loading state) */
	@Output() doubleClick = new EventEmitter<MouseEvent>();

	/** Emitted when mouse enters button area (respects disabled state) */
	@Output() mouseEnter = new EventEmitter<MouseEvent>();

	/** Emitted when mouse leaves button area (respects disabled state) */
	@Output() mouseLeave = new EventEmitter<MouseEvent>();

	/**
	 * Computed signal that generates CSS classes based on component inputs.
	 * Uses Angular signals for optimal change detection and performance.
	 *
	 * Generated classes:
	 * - `btn`: Base button class
	 * - `btn--{variant}`: Variant-specific styling
	 * - `btn--{size}`: Size-specific styling (if not medium)
	 * - `btn--full-width`: Full-width styling (if enabled)
	 *
	 * @returns Space-separated string of CSS classes
	 */
	protected buttonClasses = computed(() => {
		const classes = ["btn"];

		// Variant class
		classes.push(`btn--${this.variant}`);

		// Size class (only if not default medium)
		if (this.size !== "medium") {
			classes.push(`btn--${this.size}`);
		}

		// State classes
		if (this.fullWidth) {
			classes.push("btn--full-width");
		}

		return classes.join(" ");
	});

	/**
	 * Handles click events on the button element.
	 * Only emits event if button is not disabled or loading.
	 *
	 * @param event - Mouse event from the click
	 *
	 * @example
	 * ```html
	 * <!-- Called automatically on button click -->
	 * <app-button (clickEvent)="onSave($event)"></app-button>
	 * ```
	 */
	handleClick(event: MouseEvent): void {
		if (!this.disabled && !this.loading) {
			this.clickEvent.emit(event);
		}
	}

	/**
	 * Handles double-click events on the button element.
	 * Only emits event if button is not disabled or loading.
	 *
	 * @param event - Mouse event from the double-click
	 *
	 * @example
	 * ```html
	 * <!-- For advanced interactions -->
	 * <app-button (doubleClick)="onQuickEdit($event)"></app-button>
	 * ```
	 */
	handleDoubleClick(event: MouseEvent): void {
		if (!this.disabled && !this.loading) {
			this.doubleClick.emit(event);
		}
	}

	/**
	 * Handles mouse enter events for hover interactions.
	 * Only emits event if button is not disabled.
	 *
	 * @param event - Mouse event from entering button area
	 *
	 * @example
	 * ```html
	 * <!-- For tooltips or hover effects -->
	 * <app-button (mouseEnter)="showTooltip($event)"></app-button>
	 * ```
	 */
	handleMouseEnter(event: MouseEvent): void {
		if (!this.disabled) {
			this.mouseEnter.emit(event);
		}
	}

	/**
	 * Handles mouse leave events for hover interactions.
	 * Only emits event if button is not disabled.
	 *
	 * @param event - Mouse event from leaving button area
	 *
	 * @example
	 * ```html
	 * <!-- For hiding tooltips or resetting hover effects -->
	 * <app-button (mouseLeave)="hideTooltip($event)"></app-button>
	 * ```
	 */
	handleMouseLeave(event: MouseEvent): void {
		if (!this.disabled) {
			this.mouseLeave.emit(event);
		}
	}
}
