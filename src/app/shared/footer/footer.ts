import { Component, OnInit, inject } from "@angular/core";
import { Router, NavigationEnd, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.html",
  styleUrls: ["./footer.scss"],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class Footer implements OnInit {
  activePage = "summary";

  private router = inject(Router);

  ngOnInit(): void {
    const savedPage = localStorage.getItem("activePage");
    if (savedPage) {
      this.activePage = savedPage;
      this.router.navigate([savedPage]);
    }

    // Router-Events überwachen -> aktive Seite automatisch setzen
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const current = event.urlAfterRedirects.replace("/", "");
        this.activePage = current || "summary";
        localStorage.setItem("activePage", this.activePage);
      }
    });
  }

  isActive(page: string): boolean {
    return this.activePage === page;
  }
}
