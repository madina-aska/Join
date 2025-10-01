import { Injectable } from "@angular/core";
import { PopoverDirective } from "@core/directives/popover-directive";

@Injectable({ providedIn: "root" })
export class PopoverService {
	private popovers: PopoverDirective[] = [];

	register(popover: PopoverDirective) {
		this.popovers.push(popover);
	}

	unregister(popover: PopoverDirective) {
		this.popovers = this.popovers.filter((p) => p !== popover);
	}

	closeAll() {
		this.popovers.forEach((p) => p.close());
	}
}
