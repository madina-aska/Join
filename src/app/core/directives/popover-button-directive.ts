import { Directive, ElementRef, HostListener, inject, input } from "@angular/core";
import { PopoverDirective } from "@core/directives/popover-directive";

@Directive({
	selector: "[appPopoverButton]",
})
export class PopoverButtonDirective {
	private el = inject(ElementRef);
	popover = input<PopoverDirective>();

	@HostListener("click", ["$event"])
	onClick(event: MouseEvent) {
		event.stopPropagation();
		this.popover()?.toggle();
	}
}
