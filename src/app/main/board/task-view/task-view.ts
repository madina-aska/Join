import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { Button } from '@shared/components/button/button';

@Component({
	selector: "app-task-view",
	imports: [Button, CommonModule],
	templateUrl: "./task-view.html",
	styleUrl: "./task-view.scss",
})
export class TaskView {

  /**
   * Input: Empfängt die ID der Task, die angezeigt werden soll.
   * Das Hinzufügen dieser Zeile behebt den NG8002-Fehler in der board-view.html.
   */
  taskId = input.required<string>();
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
