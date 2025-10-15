import { Routes } from "@angular/router";
import { AddTask } from "@main/add-task/add-task";
import { Login } from "@main/auth/login/login";
import { Signup } from "@main/auth/signup/signup";
import { Board } from "@main/board/board";
import { Contacts } from "@main/contacts/contacts";
import { LegalNotice } from "@main/info/legal-notice/legal-notice";
import { PrivacyPolicy } from "@main/info/privacy-policy/privacy-policy";
import { Summary } from "@main/summary/summary";
import { authGuard } from "./core/guards/auth-guard";
import { BaseLayout } from "./layouts/base-layout/base-layout";

export const routes: Routes = [
	{ path: "login", component: Login },
	{ path: "logout", component: Login },
  { path: "signup", component: Signup },
	{
		path: "",
		component: BaseLayout,
		canActivateChild: [authGuard],
		children: [
			{ path: "", component: Summary },
			{ path: "legal-notice", component: LegalNotice },
			{ path: "privacy-policy", component: PrivacyPolicy },
			{ path: "summary", component: Summary },
			{ path: "add-task", component: AddTask },
			{ path: "board", component: Board },
			{ path: "contacts", component: Contacts },
		],
	},
	{ path: "**", redirectTo: "/" },
];
