import { Routes } from "@angular/router";
import { Summary} from "./main/summary/summary";
import { AddTask } from "./main/add-task/add-task";
import { Board } from "./main/board/board";
import { ContactList} from "./main/contacts/contact-list/contact-list";

export const routes: Routes = [
  { path: "", redirectTo: "summary", pathMatch: "full" },
  { path: "summary", component: Summary },
  { path: "add-task", component: AddTask },
  { path: "board", component: Board },
  { path: "contacts", component: ContactList },
  { path: "**", redirectTo: "summary" }
];
