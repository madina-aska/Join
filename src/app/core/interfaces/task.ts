export interface Task {
	id?: string;
	title: string;
	description?: string;
	category: "User Story" | "Technical Task";
	priority: "low" | "medium" | "urgent";
	status: "todo" | "in-progress" | "awaiting-feedback" | "done";
	assignedContacts?: string[];
	dueDate?: Date;
	subtasks?: {
		id: string;
		title: string;
		completed: boolean;
		createdAt?: Date;
	}[];
	createdAt?: Date;
	updatedAt?: Date;
	color?: number;
}
