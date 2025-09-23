import { Component, computed, EventEmitter, Input, Output } from "@angular/core";

@Component({
	selector: "app-button",
	imports: [],
	templateUrl: "./button.html",
	styleUrl: "./button.scss",
})
export class Button {
	@Input() variant:
		| "primary"
		| "fab"
		| "secondary"
		| "edit"
		| "delete"
		| "success"
		| "cancel"
		| "ghost"
		| "contact-menu" = "primary";
	@Input() size: "small" | "medium" | "large" = "medium";
	@Input() icon?: string;
	@Input() iconAlt?: string;
	@Input() loading = false;
	@Input() disabled = false;
	@Input() type: "button" | "submit" | "reset" = "button";
	@Input() fullWidth = false;

	@Output() clickEvent = new EventEmitter<MouseEvent>();
	@Output() doubleClick = new EventEmitter<MouseEvent>();
	@Output() mouseEnter = new EventEmitter<MouseEvent>();
	@Output() mouseLeave = new EventEmitter<MouseEvent>();

	// Angular 20 computed signal for dynamic classes
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

	handleClick(event: MouseEvent): void {
		if (!this.disabled && !this.loading) {
			this.clickEvent.emit(event);
		}
	}

	handleDoubleClick(event: MouseEvent): void {
		if (!this.disabled && !this.loading) {
			this.doubleClick.emit(event);
		}
	}

	handleMouseEnter(event: MouseEvent): void {
		if (!this.disabled) {
			this.mouseEnter.emit(event);
		}
	}

	handleMouseLeave(event: MouseEvent): void {
		if (!this.disabled) {
			this.mouseLeave.emit(event);
		}
	}
}
