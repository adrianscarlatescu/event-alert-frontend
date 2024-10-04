import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {SessionService} from '../session.service';
import {ToastrService} from 'ngx-toastr';
import {User} from '../../model/user';
import {Role} from '../../enums/role';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(
    private toast: ToastrService,
    private sessionService: SessionService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user: User = this.sessionService.getUser();

    const hasDefaultRole: boolean = user?.userRoles
      .map(userRole => userRole.name)
      .includes(Role.ROLE_USER);

    if (!hasDefaultRole) {
      this.toast.error('Default role required');
    }

    return hasDefaultRole;
  }

}
