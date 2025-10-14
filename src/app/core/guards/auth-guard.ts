import { inject } from "@angular/core";
import { CanActivateChildFn, Router } from "@angular/router";
import { AuthService } from "@core/services/auth-service";

export const authGuard: CanActivateChildFn = (childRoute) => {
	const path = childRoute.routeConfig?.path;
	if (path === "legal-notice" || path === "privacy-policy") {
		return true;
	}
	const authService = inject(AuthService);
	const loggedIn = true;

	const router = inject(Router);
	const urlTree = router.createUrlTree(["/login"]);
	return loggedIn || urlTree;
};
