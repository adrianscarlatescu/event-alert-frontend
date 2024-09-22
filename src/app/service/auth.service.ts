import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {Token} from '../model/token';
import {User} from '../model/user';
import {SessionService} from './session.service';
import {RegisterRequest} from '../model/request/register.request';
import {LoginRequest} from '../model/request/login.request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private sessionService: SessionService) {

  }

  register(registerRequest: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${baseUrl}/auth/register`, registerRequest);
  }

  login(loginRequest: LoginRequest): Observable<Token> {
    return this.http.post<Token>(`${baseUrl}/auth/login`, loginRequest)
      .pipe(map(tokens => {
        this.sessionService.setTokens(tokens);
        return tokens;
      }));
  }

  refresh(): Observable<Token> {
    return this.http.get<Token>(`${baseUrl}/auth/refresh`)
      .pipe(map(tokens => {
        console.log('Access token refreshed');
        this.sessionService.setTokens(tokens);
        return tokens;
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
