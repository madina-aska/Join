import { Component, output } from "@angular/core";
import { PopoverButtonDirective } from "@core/directives/popover-button-directive";
import { Popover } from "@shared/components/popover/popover";

@Component({
	selector: "app-popover-mobile",
	imports: [Popover, PopoverButtonDirective],
	templateUrl: "./popover-mobile.html",
	styleUrl: "./popover-mobile.scss",
})
export class PopoverMobile {
	clicked = output<string>();

	onClick(action: string) {
		this.clicked.emit(action);
	}
}
