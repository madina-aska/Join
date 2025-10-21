import { CommonModule } from "@angular/common";
import { Component, inject, input, OnChanges, output } from "@angular/core";
import { Contact } from "@core/interfaces/contact";
import { Task } from "@core/interfaces/task";
import { ContactService } from "@core/services/contact-service";
import { PopoverMobile } from "@main/board/popover-mobile/popover-mobile";
import { AssignedList } from "@shared/assigned-list/assigned-list";
import { ProgressBar } from "@shared/components/progress-bar/progress-bar";
import { TaskLabel } from "@shared/components/task-label/task-label";

/**
 * Displays a task card with progress and assigned contacts.
 *
 * @example
 * ```html
 * <app-board-card
 *   [task]="task"
 *   [prev]="previousStatus"
 *   [next]="nextStatus"
 *   (cardClicked)="onCardClick($event)"
 *   (popoverClicked)="onPopoverClick($event)">
 * </app-board-card>
 * ```
 */
@Component({
	selector: "app-board-card",
	standalone: true,
	imports: [CommonModule, TaskLabel, PopoverMobile, ProgressBar, AssignedList],
	templateUrl: "./board-card.html",
	styleUrl: "./board-card.scss",
})
export class BoardCard implements OnChanges {
	/**
	 * The next state category.
	 * @required
	 */
	next = input.required<"todo" | "in-progress" | "awaiting-feedback" | "done">();

	/**
	 * The previous state category.
	 * @required
	 */
	prev = input.required<"todo" | "in-progress" | "awaiting-feedback" | "done">();

	/**
	 * The task object containing details of the task.
	 * @required
	 */
	task = input.required<Task>();

	/**
	 * Emits the selected category when the popover is clicked.
	 * @emits "todo" | "in-progress" | "awaiting-feedback" | "done"
	 */
	popoverClicked = output<"todo" | "in-progress" | "awaiting-feedback" | "done">();

	/**
	 * Emits the task ID when the card is clicked.
	 * @emits string
	 */
	cardClicked = output<string>();

	/**
	 * The ContactService instance for managing contacts.
	 */
	contactService = inject(ContactService);

	/**
	 * The number of completed subtasks.
	 */
	completedSubtasks = 0;

	/**
	 * The total number of subtasks.
	 */
	amountSubtasks = 0;

	/**
	 * List of contacts assigned to the task.
	 */
	assignedContacts: Contact[] = [];

	/**
	 * Lifecycle hook that is called when input properties change.
	 * Calculates subtasks and assigned contacts.
	 */
	ngOnChanges() {
		this.calcSubtasks();
		this.getAssigned();
	}

	/**
	 * Calculates the number of completed and total subtasks.
	 */
	private calcSubtasks() {
		this.completedSubtasks =
			this.task().subtasks?.reduce((acc, curr) => {
				return acc + (curr.completed ? 1 : 0);
			}, 0) || 0;

		this.amountSubtasks = this.task().subtasks?.length || 0;
	}

	/**
	 * Retrieves the contacts assigned to the task.
	 */
	private getAssigned() {
		const ids = this.task().assignedContacts || [];

		this.contactService.allContacts$.subscribe((contacts) => {
			this.assignedContacts = contacts.filter((contact) => ids.includes(contact.id || ""));
		});
	}

	/**
	 * Emits the task ID when the card is clicked.
	 */
	openDetailView() {
		if (this.task().id) {
			this.cardClicked.emit(this.task().id!);
		}
	}

	/**
	 * Emits the selected category when the popover is clicked.
	 *
	 * @param term The selected category.
	 */
	onClickPopover(term: "todo" | "in-progress" | "awaiting-feedback" | "done") {
		this.popoverClicked.emit(term);
	}
}
