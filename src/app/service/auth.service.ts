import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {Token} from '../model/token';
import {User} from '../model/user';
import {NewToken} from '../model/new.token';
import {SessionService} from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private sessionService: SessionService) {

  }

  register(data): Observable<User> {
    return this.http.post<User>(`${baseUrl}/auth/register`, data);
  }

  login(data): Observable<Token> {
    return this.http.post<Token>(`${baseUrl}/auth/login`, data)
      .pipe(map(token => {
        this.sessionService.setAccessToken(token.accessToken);
        this.sessionService.setRefreshToken(token.refreshToken);
        return token;
      }));
  }

  refresh(): Observable<NewToken> {
    return this.http.get<NewToken>(`${baseUrl}/auth/refresh`)
      .pipe(map(response => {
        console.log('New access token received');
        this.sessionService.setAccessToken(response.accessToken);
        return response;
      }));
  }

  logout(): Observable<object> {
    return this.http.post(`${baseUrl}/auth/logout`, null)
      .pipe(map(value => {
        this.sessionService.clearStorage();
        return value;
      }));
  }

}
