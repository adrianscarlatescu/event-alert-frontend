import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {UserDto} from '../model/user.dto';
import {SessionService} from './session.service';
import {AuthTokensDto} from '../model/auth-tokens.dto';
import {AuthLoginDto} from '../model/auth-login.dto';
import {AuthRegisterDto} from '../model/auth-register.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private sessionService: SessionService) {

  }

  register(authRegister: AuthRegisterDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${baseUrl}/auth/register`, authRegister);
  }

  login(authLogin: AuthLoginDto): Observable<AuthTokensDto> {
    return this.http.post<AuthTokensDto>(`${baseUrl}/auth/login`, authLogin)
      .pipe(map(tokens => {
        this.sessionService.setAccessToken(tokens.accessToken);
        this.sessionService.setRefreshToken(tokens.refreshToken);
        return tokens;
      }));
  }

  refresh(): Observable<AuthTokensDto> {
    return this.http.get<AuthTokensDto>(`${baseUrl}/auth/refresh`)
      .pipe(map(tokens => {
        console.log('Access token refreshed');
        this.sessionService.setAccessToken(tokens.accessToken);
        this.sessionService.setRefreshToken(tokens.refreshToken);
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
