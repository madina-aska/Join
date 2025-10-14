import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

@Component({
	selector: "app-login",
	imports: [RouterLink, FormsModule],
	templateUrl: "./login.html",
	styleUrl: "./login.scss",
})
export class Login {
	email: string = "";
	password: string = "";
}
