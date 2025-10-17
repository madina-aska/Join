import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Location } from "@angular/common";

@Component({
	selector: "app-legal-notice",
	imports: [RouterModule],
	templateUrl: "./legal-notice.html",
	styleUrl: "./legal-notice.scss",
})
export class LegalNotice {
	location = inject(Location);
}
