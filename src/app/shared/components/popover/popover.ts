import { Component, HostBinding, input } from "@angular/core";
import { PopoverDirective } from "@core/directives/popover-directive";

/**
 * Popover component that displays content in a floating box anchored to a host element.
 *
 * This component provides a flexible popover solution with:
 * - **Visual variants** for different use cases (primary, secondary)
 * - **Configurable positioning** with sharp corner indicators
 * - **PopoverDirective integration** for positioning and behavior
 * - **Automatic styling** using host bindings for optimal performance
 *
 * The component uses Angular signals for reactive state management and
 * host bindings to apply CSS classes dynamically based on configuration.
 *
 * @example
 * ```html
 * <!-- Primary popover with top-right sharp corner -->
 * <app-popover variant="primary" sharpCorner="topRight">
 *   <p>Popover content goes here</p>
 * </app-popover>
 *
 * <!-- Secondary popover with bottom-left sharp corner -->
 * <app-popover variant="secondary" sharpCorner="bottomLeft">
 *   <div>Custom content</div>
 * </app-popover>
 * ```
 */
@Component({
	hostDirectives: [PopoverDirective],
	selector: "app-popover",
	imports: [],
	templateUrl: "./popover.html",
	styleUrl: "./popover.scss",
})
export class Popover {
	/**
	 * Visual variant of the popover determining its color scheme and styling.
	 *
	 * Variants:
	 * - `primary`: Main popover style with primary color scheme
	 * - `secondary`: Alternative style with secondary color scheme
	 *
	 * @default "primary"
	 */
	variant = input<"primary" | "secondary">("primary");

	/**
	 * Position of the sharp corner that points toward the trigger element.
	 *
	 * Sharp corners:
	 * - `topRight`: Sharp corner at top-right (popover below-left of trigger)
	 * - `bottomRight`: Sharp corner at bottom-right (popover above-left of trigger)
	 * - `bottomLeft`: Sharp corner at bottom-left (popover above-right of trigger)
	 * - `topLeft`: Sharp corner at top-left (popover below-right of trigger)
	 *
	 * @default "topRight"
	 */
	sharpCorner = input<"topRight" | "bottomRight" | "bottomLeft" | "topLeft">("topRight");

	/**
	 * Host binding for primary variant CSS class.
	 * @internal
	 */
	@HostBinding("class.primary")
	get isPrimary() {
		return this.variant() === "primary";
	}

	/**
	 * Host binding for secondary variant CSS class.
	 * @internal
	 */
	@HostBinding("class.secondary")
	get isSecondary() {
		return this.variant() === "secondary";
	}

	/**
	 * Host binding for top-right sharp corner CSS class.
	 * @internal
	 */
	@HostBinding("class.sharp-top-right")
	get sharpTopRight() {
		return this.sharpCorner() === "topRight";
	}

	/**
	 * Host binding for bottom-right sharp corner CSS class.
	 * @internal
	 */
	@HostBinding("class.sharp-bottom-right")
	get sharpBottomRight() {
		return this.sharpCorner() === "bottomRight";
	}

	/**
	 * Host binding for bottom-left sharp corner CSS class.
	 * @internal
	 */
	@HostBinding("class.sharp-bottom-left")
	get sharpBottomLeft() {
		return this.sharpCorner() === "bottomLeft";
	}

	/**
	 * Host binding for top-left sharp corner CSS class.
	 * @internal
	 */
	@HostBinding("class.sharp-top-left")
	get sharpTopLeft() {
		return this.sharpCorner() === "topLeft";
	}
}
