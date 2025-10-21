import { Component, input, output } from "@angular/core";
import { PopoverButtonDirective } from "@core/directives/popover-button-directive";
import { Popover } from "@shared/components/popover/popover";

/**
 * A mobile-friendly popover component that facilitates task status transitions.
 *
 * @remarks
 * This component is designed for mobile interfaces, providing a popover menu
 * that allows users to change the status of a task. It emits the selected status
 * to the parent component for further processing.
 *
 * @example
 * ```html
 * <app-popover-mobile
 *   [next]="'in-progress'"
 *   [prev]="'todo'"
 *   (clicked)="onStatusChange($event)">
 * </app-popover-mobile>
 * ```
 */
@Component({
	selector: "app-popover-mobile",
	imports: [Popover, PopoverButtonDirective],
	templateUrl: "./popover-mobile.html",
	styleUrl: "./popover-mobile.scss",
})
export class PopoverMobile {
	/**
	 * The next status in the task workflow.
	 *
	 * @remarks
	 * This input defines the subsequent status that the task can transition to.
	 * It is used to display the next status option in the popover menu.
	 */
	next = input.required<"todo" | "in-progress" | "awaiting-feedback" | "done">();

	/**
	 * The previous status in the task workflow.
	 *
	 * @remarks
	 * This input defines the previous status that the task was in.
	 * It is used to display the previous status option in the popover menu.
	 */
	prev = input.required<"todo" | "in-progress" | "awaiting-feedback" | "done">();

	/**
	 * Event emitted when a status is selected from the popover menu.
	 *
	 * @param action - The selected status action.
	 *
	 * @remarks
	 * This output emits the selected status action to the parent component.
	 * It allows the parent component to handle the status change accordingly.
	 */
	clicked = output<"todo" | "in-progress" | "awaiting-feedback" | "done">();

	/**
	 * Handles the click event on a status button in the popover menu.
	 *
	 * @param action - The status action that was clicked.
	 *
	 * @remarks
	 * This method emits the clicked status action to the parent component.
	 */
	onClick(action: "todo" | "in-progress" | "awaiting-feedback" | "done") {
		this.clicked.emit(action);
	}
}
