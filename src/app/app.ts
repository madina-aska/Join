import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Footer } from "./shared/footer/footer";
import { Header } from "./shared/header/header";
import { Sidebar } from "./shared/sidebar/sidebar";

@Component({
	selector: "app-root",
	imports: [RouterOutlet, Sidebar, Header, Footer],
	templateUrl: "./app.html",
	styleUrl: "./app.scss",
})
export class App {
	protected readonly title = signal("join");
}
