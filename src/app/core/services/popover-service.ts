import { Injectable } from "@angular/core";
import { PopoverDirective } from "@core/directives/popover-directive";

/**
 * Service for managing popover instances within the application.
 *
 * This service allows components to register and unregister their popovers,
 * and provides a method to close all registered popovers simultaneously.
 *
 * @example
 * ```typescript
 * // Inject the service
 * private popoverService = inject(PopoverService);
 *
 * // Register a popover
 * this.popoverService.register(this.popoverDirective);
 *
 * // Unregister a popover
 * this.popoverService.unregister(this.popoverDirective);
 *
 * // Close all popovers
 * this.popoverService.closeAll();
 * ```
 */
@Injectable({
	providedIn: "root",
})
export class PopoverService {
	/**
	 * Array holding all registered popover instances.
	 *
	 * @internal
	 */
	private popovers: PopoverDirective[] = [];

	/**
	 * Registers a popover instance to be managed by the service.
	 *
	 * @param popover - The popover instance to register.
	 *
	 * @remarks
	 * This method adds the provided `PopoverDirective` instance to the internal
	 * list of popovers, allowing it to be controlled by the service.
	 */
	register(popover: PopoverDirective): void {
		this.popovers.push(popover);
	}

	/**
	 * Unregisters a popover instance from the service.
	 *
	 * @param popover - The popover instance to unregister.
	 *
	 * @remarks
	 * This method removes the provided `PopoverDirective` instance from the internal
	 * list of popovers, stopping it from being controlled by the service.
	 */
	unregister(popover: PopoverDirective): void {
		this.popovers = this.popovers.filter((p) => p !== popover);
	}

	/**
	 * Closes all registered popovers.
	 *
	 * @remarks
	 * This method iterates over all registered `PopoverDirective` instances and
	 * calls their `close()` method, effectively closing all open popovers.
	 */
	closeAll(): void {
		this.popovers.forEach((p) => p.close());
	}
}
