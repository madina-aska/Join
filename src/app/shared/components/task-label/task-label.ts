import { Component, computed, input } from "@angular/core";

@Component({
	selector: "app-task-label",
	imports: [],
	templateUrl: "./task-label.html",
	styleUrl: "./task-label.scss",
})
export class TaskLabel {
	category = input<string>("");
	categoryClean = computed(() => this.category().toLowerCase().trim().replace(/[- ]/g, ""));
	categories = [
		{ value: "User Story", name: "userstory" },
		{ value: "Technical Task", name: "technicaltask" },
	];
}
