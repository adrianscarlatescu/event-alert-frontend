import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../model/user';
import {HttpClient} from '@angular/common/http';
import {baseUrl} from '../../environments/environment';
import {UserRequest} from '../model/request/user.request';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${baseUrl}/profile`);
  }

  putProfile(userRequest: UserRequest): Observable<User> {
    return this.http.put<User>(`${baseUrl}/profile`, userRequest);
  }

}
