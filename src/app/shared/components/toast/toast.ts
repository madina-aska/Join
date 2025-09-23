import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	computed,
	signal,
} from "@angular/core";
import { Button } from "../button/button";

export interface ToastAction {
	label: string;
	handler: () => void;
}

@Component({
	selector: "app-toast",
	imports: [Button],
	templateUrl: "./toast.html",
	styleUrl: "./toast.scss",
})
export class Toast implements OnInit, OnDestroy {
	@Input() type: "success" | "error" | "warning" | "info" = "success";
	@Input() title?: string;
	@Input() message = "";
	@Input() duration = 4000;
	@Input() showCloseButton = true;
	@Input() icon?: string;
	@Input() action?: ToastAction;

	@Output() closeEvent = new EventEmitter<void>();
	@Output() actionEvent = new EventEmitter<void>();

	// Angular 20 signals
	protected visible = signal(true);
	protected leaving = signal(false);

	private timeoutId?: number;

	// Computed classes
	protected toastClasses = computed(() => {
		const classes = ["toast"];
		classes.push(`toast--${this.type}`);

		if (this.leaving()) {
			classes.push("toast--leaving");
		}

		return classes.join(" ");
	});

	ngOnInit(): void {
		// Auto-dismiss after duration (if > 0)
		if (this.duration > 0) {
			this.timeoutId = window.setTimeout(() => {
				this.close();
			}, this.duration);
		}
	}

	ngOnDestroy(): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
	}

	close(): void {
		this.leaving.set(true);

		// Wait for animation to complete before hiding
		setTimeout(() => {
			this.visible.set(false);
			this.closeEvent.emit();
		}, 600); // Animation duration
	}

	handleAction(): void {
		if (this.action) {
			this.action.handler();
			this.actionEvent.emit();
		}
	}

	// Public method to show toast
	show(): void {
		this.visible.set(true);
	}

	// Public method to hide toast
	hide(): void {
		this.visible.set(false);
	}
}
