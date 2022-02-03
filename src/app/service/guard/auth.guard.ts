import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {SessionService} from '../session.service';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(
    private router: Router,
    private sessionService: SessionService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isToken = this.sessionService.getAccessToken();
    if (isToken && !this.jwtHelper.isTokenExpired(isToken)) {
      // logged in, continue
      return true;
    }

    // if the token is expired, should request a new one using the refresh token
    // otherwise redirect
    this.router.navigate(['/auth'], {queryParams: {returnUrl: state.url}});
    return false;
  }
}
