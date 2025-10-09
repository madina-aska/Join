import { Component, input, output } from "@angular/core";
import { PopoverButtonDirective } from "@core/directives/popover-button-directive";
import { Popover } from "@shared/components/popover/popover";

@Component({
	selector: "app-popover-mobile",
	imports: [Popover, PopoverButtonDirective],
	templateUrl: "./popover-mobile.html",
	styleUrl: "./popover-mobile.scss",
})
export class PopoverMobile {
	next = input.required<"todo" | "in-progress" | "awaiting-feedback" | "done">();
	prev = input.required<"todo" | "in-progress" | "awaiting-feedback" | "done">();
	clicked = output<"todo" | "in-progress" | "awaiting-feedback" | "done">();

	onClick(action: "todo" | "in-progress" | "awaiting-feedback" | "done") {
		this.clicked.emit(action);
	}
}
