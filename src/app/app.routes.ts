import { Routes } from "@angular/router";
import { AddTask } from "@main/add-task/add-task";
import { Board } from "@main/board/board";
import { Contacts } from "@main/contacts/contacts";
import { Summary } from "@main/summary/summary";

export const routes: Routes = [
	{ path: "", redirectTo: "summary", pathMatch: "full" },
	{ path: "summary", component: Summary },
	{ path: "add-task", component: AddTask },
	{ path: "board", component: Board },
	{ path: "contacts", component: Contacts },
	{ path: "**", redirectTo: "summary" },
];
