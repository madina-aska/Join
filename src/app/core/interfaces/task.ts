export interface Task {
	id?: string;
	title: string;
	description?: string;
	category: "User Story" | "Technical Task";
	priority: "low" | "medium" | "urgent";
	status: "todo" | "in-progress" | "awaiting-feedback" | "done";
	assignedContacts?: string[];
	dueDate?: string | undefined;
	subtasks?: {
		id: string;
		title: string;
		completed: boolean;
		createdAt?: string | undefined;
	}[];
	createdAt?: string | undefined;
	updatedAt?: string | undefined;
	color?: number;
}
