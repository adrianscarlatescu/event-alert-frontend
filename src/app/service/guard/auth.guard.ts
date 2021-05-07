import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {SessionService} from '../session.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private sessionService: SessionService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isToken = this.sessionService.getAccessToken();
    if (isToken) {
      // logged in so return true
      return true;
    }

    // not logged in so redirect to onLogin page with the return url
    this.router.navigate(['/auth'], {queryParams: {returnUrl: state.url}});
    return false;
  }
}
