import { Component, input, output, signal } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";

/**
 * Represents the error states for the search field component.
 * Used to manage and display validation errors based on user input.
 */
interface ErrorCheck {
	/** Indicates whether the field is required and has not been filled */
	required: boolean;

	/** Indicates whether the input length is less than the minimum required */
	minLength: boolean;

	/** Holds the ID of the timeout used to reset error states */
	timeout: null | number;
}

/**
 * A search input field component that emits the current value when the user changes the input's value.
 * Displays error messages for required and minimum length validation.
 *
 * @example
 * ```html
 * <app-search-field (searchText)="onSearch($event)"></app-search-field>
 * ```
 */
@Component({
	selector: "app-search-field",
	imports: [FormsModule],
	templateUrl: "./search-field.html",
	styleUrls: ["./search-field.scss"],
})
export class SearchField {
	/** Minimum required length for the input */
	minlength = input<number>(3);

	/** Current value of the search field */
	textValue = signal("");

	/** Output emitter for the search text */
	searchText = output<string>();

	/** Error state flags */
	showError: ErrorCheck = {
		required: false,
		minLength: false,
		timeout: null,
	};

	/**
	 * Handles the search action when the user changes the input's value.
	 * Emits the current text value if valid, otherwise shows errors.
	 *
	 * @param input The NgModel instance of the search input
	 */
	onSearch(input: NgModel) {
		if (this.showError.timeout) {
			clearTimeout(this.showError.timeout);
		}

		if (input.valid) {
			this.emitText(this.textValue());
		} else {
			this.showErrors(input);
			this.emitText("");
		}
	}

	/**
	 * Emits the provided text value.
	 *
	 * @param text The text to emit
	 */
	private emitText(text: string) {
		this.searchText.emit(text);
	}

	/**
	 * Displays error messages based on the input validation state.
	 *
	 * @param input The NgModel instance of the search input
	 */
	private showErrors(input: NgModel) {
		if (input.errors?.["required"]) {
			this.showError.required = true;
		} else if (input.errors?.["minlength"]) {
			this.showError.minLength = true;
		}

		this.showError.timeout = setTimeout(() => {
			this.showError.minLength = false;
			this.showError.required = false;
		}, 3000);
	}
}
