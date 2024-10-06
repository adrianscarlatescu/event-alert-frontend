import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {SessionService} from '../session.service';
import {ToastrService} from 'ngx-toastr';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(
    private toast: ToastrService,
    private sessionService: SessionService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isUserAdmin: boolean = this.sessionService.isUserAdmin();

    if (state.url == '/admin' && !isUserAdmin) {
      this.toast.error('Admin role required');
      return false;
    }

    return true;
  }

}
