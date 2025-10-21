import { Directive, ElementRef, HostListener, inject, input } from "@angular/core";
import { PopoverDirective } from "@core/directives/popover-directive";

/**
 * A directive that links an element to a pop-over button behavior.
 */
@Directive({
	selector: "[appPopoverButton]",
})
export class PopoverButtonDirective {
	/**
	 * Reference to the host element this directive is attached to.
	 */
	private el = inject(ElementRef);

	/**
	 * Reference to the associated pop-over directive instance.
	 */
	popover = input<PopoverDirective>();

	/**
	 * Handles click events on the host element to toggle the pop-over.
	 *
	 * @param event - The mouse event triggered by the click.
	 */
	@HostListener("click", ["$event"])
	onClick(event: MouseEvent) {
		event.stopPropagation();
		this.popover()?.toggle();
	}
}
