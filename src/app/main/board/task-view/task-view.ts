import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { Button } from "@shared/components/button/button";

@Component({
	selector: "app-task-view",
	imports: [Button, CommonModule],
	templateUrl: "./task-view.html",
	styleUrl: "./task-view.scss",
})
export class TaskView {
	/** Controls overlay visibility state */
	isOverlayOpen = false;

	/** Emitted when the task-view overlay is closed */
	@Output() closed = new EventEmitter<void>();

	/** Emitted when the task-view overlay is opened */
	@Output() open = new EventEmitter<void>();
	@Output() edit = new EventEmitter<void>();

	closeOverlay() {
		this.closed.emit();
	}

	openOverlay() {
		this.open.emit();
	}
	onEditClick() {
		this.edit.emit();
	}
}
