import { Component, OnInit, inject } from "@angular/core";
import { Router, NavigationEnd, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

/**
 * Footer navigation component with persistent page state management.
 *
 * This component provides the main navigation interface with sophisticated state management:
 * - **Persistent Navigation State**: Saves and restores active page via localStorage
 * - **Router Integration**: Automatic page detection through router events
 * - **Visual State Feedback**: Active page highlighting for user orientation
 * - **Auto-navigation**: Restores last visited page on app restart
 *
 * State Management Flow:
 * 1. **Initialization**: Loads saved page from localStorage
 * 2. **Auto-navigation**: Navigates to restored page if available
 * 3. **Router Monitoring**: Subscribes to NavigationEnd events
 * 4. **State Persistence**: Updates localStorage on each navigation
 * 5. **UI Updates**: Provides active state for visual feedback
 *
 * Supported Pages:
 * - `summary`: Dashboard overview
 * - `board`: Task board interface
 * - `add-task`: Task creation form
 * - `contacts`: Contact management
 *
 * @example
 * ```html
 * <app-footer></app-footer>
 *
 * <!-- Footer automatically manages navigation state -->
 * <nav>
 *   <a routerLink="/summary" [class.active]="isActive('summary')">Summary</a>
 *   <a routerLink="/contacts" [class.active]="isActive('contacts')">Contacts</a>
 * </nav>
 * ```
 */
@Component({
  selector: "app-footer",
  templateUrl: "./footer.html",
  styleUrls: ["./footer.scss"],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class Footer implements OnInit {
  /** Current active page name for state management and UI highlighting */
  activePage = "summary";

  /** Injected Angular router for navigation and event monitoring */
  private router = inject(Router);

  /**
   * Angular lifecycle hook that initializes navigation state management.
   *
   * Initialization Flow:
   * 1. **Restore State**: Loads last active page from localStorage
   * 2. **Auto-navigate**: Navigates to restored page if available
   * 3. **Monitor Routes**: Subscribes to router events for real-time updates
   * 4. **State Sync**: Updates internal state and localStorage on navigation
   *
   * @example
   * ```typescript
   * // Called automatically by Angular
   * // User returns to app -> navigates to last visited page
   * // Router events -> automatically update active page state
   * ```
   */
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

  /**
   * Determines if a given page is currently active.
   * Used for applying active state styling in the template.
   *
   * @param page - Page name to check against current active page
   * @returns True if the specified page is currently active
   *
   * @example
   * ```html
   * <!-- Template usage for active state styling -->
   * <a routerLink="/summary" [class.active]="isActive('summary')">
   * <a routerLink="/contacts" [class.active]="isActive('contacts')">
   *
   * <!-- Results in active class when on respective pages -->
   * ```
   */
  isActive(page: string): boolean {
    return this.activePage === page;
  }
}
