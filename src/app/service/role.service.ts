import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {RoleDto} from '../model/role.dto';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private cachedRoles: RoleDto[];

  constructor(private http: HttpClient) {
  }

  getRoles(): Observable<RoleDto[]> {
    if (this.cachedRoles) {
      return of(this.cachedRoles);
    }
    return this.http.get<RoleDto[]>(`${baseUrl}/roles`)
      .pipe(tap(roles => this.cachedRoles = roles));
  }

}
