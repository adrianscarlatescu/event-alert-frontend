import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {SessionService} from '../session.service';
import {ToastrService} from 'ngx-toastr';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private toast: ToastrService,
    private sessionService: SessionService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const accessToken: string = this.sessionService.getAccessToken();
    const refreshToken: string = this.sessionService.getRefreshToken();
    if (accessToken && refreshToken) {
      return true;
    }

    localStorage.clear();
    this.toast.warning('Authorization tokens required');
    this.router.navigate(['/auth'], {queryParams: {returnUrl: state.url}});
    return false;
  }

}
