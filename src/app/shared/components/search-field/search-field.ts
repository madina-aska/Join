import { Component, input, output, signal } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";

interface ErrorCheck {
	required: boolean;
	minLength: boolean;
	timeout: null | number;
}

@Component({
	selector: "app-search-field",
	imports: [FormsModule],
	templateUrl: "./search-field.html",
	styleUrl: "./search-field.scss",
})
export class SearchField {
	minlength = input<number>(3);
	textValue = signal("");
	searchText = output<string>();
	showError: ErrorCheck = {
		required: false,
		minLength: false,
		timeout: null,
	};

	onSearch(input: NgModel) {
		if (this.showError.timeout) {
			clearTimeout(this.showError.timeout);
		}

		if (input.valid) {
			this.emitText();
		} else {
			this.showErrors(input);
		}
	}

	private emitText() {
		this.searchText.emit(this.textValue());
	}

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
