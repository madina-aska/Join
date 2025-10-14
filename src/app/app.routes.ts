import { Routes } from "@angular/router";
import { AddTask } from "@main/add-task/add-task";
import { Login } from "@main/auth/login/login";
import { Board } from "@main/board/board";
import { Contacts } from "@main/contacts/contacts";
import { Summary } from "@main/summary/summary";
import { BaseLayout } from "./layouts/base-layout/base-layout";


export const routes: Routes = [
	{ path: "", component: Login },
	{ path: "login", component: Login },
	{
		path: "",
		component: BaseLayout,
		children: [
			{ path: "summary", component: Summary },
			{ path: "add-task", component: AddTask },
			{ path: "board", component: Board },
			{ path: "contacts", component: Contacts },
			{ path: "**", redirectTo: "/" },
		],
	},
];
