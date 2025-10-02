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
  
	// MULTI-SELECT: store multiple assigned users
	assignedTo: string[] = [];

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

	// Dropdown states
	assignedDropdownOpen = false;
	categoryDropdownOpen = false;

	// For highlighting active items (optional)
	activeItem: string | null = null;
	activeCategory: string | null = null;

	// Assigned-to dropdown toggle
	onInputClick() {
		this.assignedDropdownOpen = !this.assignedDropdownOpen;
	}

	// Category dropdown toggle
	onCategoryClick() {
		this.categoryDropdownOpen = !this.categoryDropdownOpen;
	}


	// Category select
	selectCategory(cat: string) {
		this.activeCategory = cat;
		this.category = cat;

		setTimeout(() => {
			this.categoryDropdownOpen = false;
			this.activeCategory = null;
		}, 120);
	}

	// === Multi-select logic ===
	isAssigned(name: string): boolean {
		return this.assignedTo.includes(name);
	}

	toggleAssigned(name: string) {
		if (this.isAssigned(name)) {
			this.assignedTo = this.assignedTo.filter((p) => p !== name);
		} else {
			this.assignedTo.push(name);
		}
	}
}
