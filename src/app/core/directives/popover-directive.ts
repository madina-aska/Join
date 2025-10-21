import { Directive, ElementRef, inject, OnDestroy, OnInit } from "@angular/core";
import { PopoverService } from "@core/services/popover-service";

/**
 * Directive that turns an element into a pop-over container,
 * controllable via the exported “appPopover” API.
 */
@Directive({
	selector: "[appPopover]",
	exportAs: "appPopover",
})
export class PopoverDirective implements OnInit, OnDestroy {
	/**
	 * Indicates whether the pop-over is currently open.
	 */
	isOpen = false;

	/**
	 * Reference to the host element this directive is applied on.
	 */
	el = inject(ElementRef);

	/**
	 * Service for registering/unregistering this pop-over instance.
	 */
	private popoverService = inject(PopoverService);

	/**
	 * Registers this pop-over with the service when the directive is initialized.
	 */
	ngOnInit() {
		this.popoverService.register(this);
	}

	/**
	 * Unregisters this pop-over from the service when the directive is destroyed.
	 */
	ngOnDestroy() {
		this.popoverService.unregister(this);
	}

	/**
	 * Opens the pop-over: sets its visible state and styles accordingly.
	 * @private
	 */
	private open() {
		this.isOpen = true;
		this.el.nativeElement.style.opacity = "initial";
		this.el.nativeElement.style.visibility = "initial";
	}

	/**
	 * Closes the pop-over: sets its hidden state and styles accordingly.
	 * @private
	 */
	private close() {
		this.isOpen = false;
		this.el.nativeElement.style.opacity = "0";
		this.el.nativeElement.style.visibility = "hidden";
	}

	/**
	 * Toggles the pop-over between open and closed states.
	 */
	toggle() {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}
}
