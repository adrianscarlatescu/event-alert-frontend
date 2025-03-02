import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {UserDto} from '../model/user.dto';
import {HttpClient} from '@angular/common/http';
import {baseUrl} from '../../environments/environment';
import {UserUpdateDto} from '../model/user-update.dto';
import {map, tap} from 'rxjs/operators';
import {RoleId} from '../enums/id/role-id';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${baseUrl}/users/profile`);
  }

  putProfile(userUpdate: UserUpdateDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${baseUrl}/users/profile`, userUpdate);
  }

}
