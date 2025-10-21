import { inject } from "@angular/core";
import { CanActivateChildFn, Router, UrlTree } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { map, Observable } from "rxjs";

/**
 * Determines whether a user can access a child route based on authentication status.
 *
 * @param childRoute - The child route being navigated to.
 * @returns An observable that resolves to a boolean indicating access permission,
 *          or a `UrlTree` for redirection if the user is not authenticated.
 */
export const authGuard: CanActivateChildFn = (
	childRoute,
): Observable<boolean | UrlTree> | boolean | UrlTree => {
	const authService = inject(AuthService);
	const router = inject(Router);

	const path = childRoute.routeConfig?.path;
	if (path === "legal-notice" || path === "privacy-policy" || path === "help") {
		return true;
	}

	return authService.isLoggedInOnce().pipe(
		map((isLoggedIn) => {
			if (isLoggedIn) {
				return true;
			} else {
				return router.createUrlTree(["/login"]);
			}
		}),
	);
};
