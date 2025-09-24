import { Component, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Footer } from "./shared/footer/footer";
import { Header } from "./shared/header/header";
import { Toast } from "./shared/components/toast/toast";
import { ToastService } from "./shared/services/toast.service";

@Component({
	selector: "app-root",
	imports: [RouterOutlet, Header, Footer, Toast],
	templateUrl: "./app.html",
	styleUrl: "./app.scss",
})
export class App {
	protected readonly title = signal("join");
	protected toastService = inject(ToastService);
  
	protected currentToast = this.toastService.toast;
}
