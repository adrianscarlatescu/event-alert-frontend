import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {UserService} from '../user.service';
import {map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(
    private toast: ToastrService,
    private userService: UserService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (state.url !== '/admin') {
      return of(true);
    }

    return this.userService.isConnectedUserAdmin()
      .pipe(map(value => {
        if (!value) {
          this.toast.error('Admin role required');
        }
        return value;
      }));
  }

}
