import { Directive, ElementRef, inject, OnDestroy, OnInit } from "@angular/core";
import { PopoverService } from "@core/services/popover-service";

@Directive({
	selector: "[appPopover]",
	exportAs: "appPopover",
})
export class PopoverDirective implements OnInit, OnDestroy {
	isOpen = false;
	el = inject(ElementRef);
	private popoverService = inject(PopoverService);

	ngOnInit() {
		this.popoverService.register(this);
	}

	ngOnDestroy() {
		this.popoverService.unregister(this);
	}

	open() {
		this.isOpen = true;
		this.el.nativeElement.style.opacity = "initial";
		this.el.nativeElement.style.visibility = "initial";
	}

	close() {
		this.isOpen = false;
		this.el.nativeElement.style.opacity = "0";
		this.el.nativeElement.style.visibility = "hidden";
	}

	toggle() {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}
}
