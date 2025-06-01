import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {SessionService} from '../session.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(private sessionService: SessionService,
              private toastrService: ToastrService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (state.url !== '/admin') {
      return true;
    }

    if (!this.sessionService.isConnectedUserAdmin()) {
      this.toastrService.error('Admin role required');
      return false;
    }

    return true;
  }

}
