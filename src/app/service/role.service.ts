import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {RoleDto} from '../model/role.dto';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private http: HttpClient) {
  }

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${baseUrl}/roles`);
  }

}
