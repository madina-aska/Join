import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
	selector: "app-add-task-form",
	imports: [FormsModule, CommonModule],
	templateUrl: "./add-task-form.html",
	styleUrl: "./add-task-form.scss",
})
export class AddTaskForm {
	title = "";
	description = "";
	dueDate = "";
	category = "";
	subtask = "";
	assignedTo = "";

	titleFocus = false;
	dueDateFocus = false;
	categoryFocus = false;
	descriptionFocus = false;
	assignedFocus = false;
	subtaskFocus = false;
	categoryTouched = false;

	selectedPriority = "";
	setPriority(priority: string) {
		this.selectedPriority = priority;
	}

	assignedDropdownOpen = false;
	activeItem: string | null = null;

	onInputClick() {
		this.assignedDropdownOpen = !this.assignedDropdownOpen;
	}

	selectAssigned(name: string) {
		this.activeItem = name;
		this.assignedTo = name;

		setTimeout(() => {
			this.assignedDropdownOpen = false;
			this.activeItem = null;
		}, 120);
	}

	categoryDropdownOpen = false;
	activeCategory: string | null = null;

	onCategoryClick() {
		this.categoryDropdownOpen = !this.categoryDropdownOpen;
	}

	selectCategory(cat: string) {
		this.activeCategory = cat;
		this.category = cat;

		setTimeout(() => {
			this.categoryDropdownOpen = false;
			this.activeCategory = null;
		}, 120);
	}
}
