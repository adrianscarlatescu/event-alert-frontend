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
    const accessToken: string = this.sessionService.getAccessToken();
    const refreshToken: string = this.sessionService.getRefreshToken();
    if (accessToken && refreshToken && !this.jwtHelper.isTokenExpired(refreshToken)) {
      // logged in with valid tokens, continue
      return true;
    }

    this.router.navigate(['/auth'], {queryParams: {returnUrl: state.url}});
    return false;
  }

}
