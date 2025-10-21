import { Component, HostBinding, input } from "@angular/core";
import { PopoverDirective } from "@core/directives/popover-directive";

/**
 * A pop-over component that displays content in a floating box anchored to a host element.
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
	 * Defines the visual variant of the pop-over: either primary or secondary.
	 */
	variant = input<"primary" | "secondary">("primary");

	/**
	 * Defines which corner of the pop-over box is sharp (pointing toward the trigger).
	 */
	sharpCorner = input<"topRight" | "bottomRight" | "bottomLeft" | "topLeft">("topRight");

	/** @internal */
	@HostBinding("class.primary")
	get isPrimary() {
		return this.variant() === "primary";
	}

	/** @internal */
	@HostBinding("class.secondary")
	get isSecondary() {
		return this.variant() === "secondary";
	}

	/** @internal */
	@HostBinding("class.sharp-top-right")
	get sharpTopRight() {
		return this.sharpCorner() === "topRight";
	}

	/** @internal */
	@HostBinding("class.sharp-bottom-right")
	get sharpBottomRight() {
		return this.sharpCorner() === "bottomRight";
	}

	/** @internal */
	@HostBinding("class.sharp-bottom-left")
	get sharpBottomLeft() {
		return this.sharpCorner() === "bottomLeft";
	}

	/** @internal */
	@HostBinding("class.sharp-top-left")
	get sharpTopLeft() {
		return this.sharpCorner() === "topLeft";
	}
}
