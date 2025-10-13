import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Footer } from "@shared/footer/footer";
import { Header } from "@shared/header/header";

@Component({
	selector: "app-base-layout",
	imports: [Header, RouterOutlet, Footer],
	templateUrl: "./base-layout.html",
	styleUrl: "./base-layout.scss",
})
export class BaseLayout {}
