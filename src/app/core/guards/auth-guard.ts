import { inject } from "@angular/core";
import { CanActivateChildFn, Router, UrlTree } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { map, Observable } from "rxjs";

/**
 * Route Guard zum Schutz der Kinderrouten des Main-Moduls.
 * Erlaubt den Zugriff nur, wenn der Benutzer eingeloggt ist.
 */
export const authGuard: CanActivateChildFn = (
	childRoute,
): Observable<boolean | UrlTree> | boolean | UrlTree => {
	const authService = inject(AuthService);
	const router = inject(Router);

	// 1. Ausnahmen für öffentlich zugängliche Seiten (Impressum, Datenschutz)
	const path = childRoute.routeConfig?.path;
	if (path === "legal-notice" || path === "privacy-policy" || path === "help") {
		return true;
	}

	// 2. Prüfe den Anmeldestatus mithilfe des dedizierten Once-Observables
	return authService.isLoggedInOnce().pipe(
		map((isLoggedIn) => {
			if (isLoggedIn) {
				// Angemeldet: Erlaube den Zugriff
				return true;
			} else {
				// Nicht angemeldet: Gib eine UrlTree zum Login zurück
				return router.createUrlTree(["/login"]);
			}
		}),
	);
};
