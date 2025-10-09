import { CommonModule } from "@angular/common";
import { Component, inject, input, OnChanges, output } from "@angular/core";
import { Task } from "@core/interfaces/task";
import { Contact } from "@core/interfaces/contact";
import { ContactService } from "@core/services/contact-service";
import { AssignedList } from "@shared/assigned-list/assigned-list";
import { ProgressBar } from "@shared/components/progress-bar/progress-bar";
import { TaskLabel } from "@shared/components/task-label/task-label";
import { PopoverMobile } from "@main/board/popover-mobile/popover-mobile";

@Component({
	selector: "app-board-card",
	standalone: true,
	imports: [CommonModule, TaskLabel, PopoverMobile, ProgressBar, AssignedList],
	templateUrl: "./board-card.html",
	styleUrl: "./board-card.scss",
})
export class BoardCard implements OnChanges {
	next = input.required<"todo" | "in-progress" | "awaiting-feedback" | "done">();
	prev = input.required<"todo" | "in-progress" | "awaiting-feedback" | "done">();
	task = input.required<Task>();
	popoverClicked = output<"todo" | "in-progress" | "awaiting-feedback" | "done">();
	cardClicked = output<string>();
	contactService = inject(ContactService);
	completedSubtasks = 0;
	amountSubtasks = 0;
	assignedContacts: Contact[] = [];

	ngOnChanges() {
		this.calcSubtasks();
		this.getAssigned();
	}

	private calcSubtasks() {
		this.completedSubtasks =
			this.task().subtasks?.reduce((acc, curr) => {
				return acc + (curr.completed ? 1 : 0);
			}, 0) || 0;

		this.amountSubtasks = this.task().subtasks?.length || 0;
	}

	private getAssigned() {
		const ids = this.task().assignedContacts || [];

		this.contactService.allContacts$.subscribe((contacts) => {
			this.assignedContacts = contacts.filter((contact) => ids.includes(contact.id || ""));
		});
	}

	openDetailView() {
		if (this.task().id) {
			this.cardClicked.emit(this.task().id!);
		}
	}

	onClickPopover(term: "todo" | "in-progress" | "awaiting-feedback" | "done") {
		this.popoverClicked.emit(term);
	}
}
