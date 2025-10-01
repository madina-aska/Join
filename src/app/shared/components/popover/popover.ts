import { Component, HostBinding, input } from "@angular/core";
import { PopoverDirective } from "@core/directives/popover-directive";

@Component({
	hostDirectives: [PopoverDirective],
	selector: "app-popover",
	imports: [],
	templateUrl: "./popover.html",
	styleUrl: "./popover.scss",
})
export class Popover {
	variant = input<"primary" | "secondary">("primary");
	sharpCorner = input<"topRight" | "bottomRight" | "bottomLeft" | "topLeft">("topRight");

	@HostBinding("class.primary")
	get isPrimary() {
		return this.variant() === "primary";
	}

	@HostBinding("class.secondary")
	get isSecondary() {
		return this.variant() === "secondary";
	}

	@HostBinding("class.sharp-top-right")
	get sharpTopRight() {
		return this.sharpCorner() === "topRight";
	}

	@HostBinding("class.sharp-bottom-right")
	get sharpBottomRight() {
		return this.sharpCorner() === "bottomRight";
	}

	@HostBinding("class.sharp-bottom-left")
	get sharpBottomLeft() {
		return this.sharpCorner() === "bottomLeft";
	}

	@HostBinding("class.sharp-top-left")
	get sharpTopLeft() {
		return this.sharpCorner() === "topLeft";
	}
}
