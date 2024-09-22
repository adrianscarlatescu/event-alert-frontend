import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from '../auth.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {concatMap, mergeMap} from 'rxjs/operators';
import {SessionService} from '../session.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private jwtHelper: JwtHelperService = new JwtHelperService();
  private isRefreshing: boolean = false;

  constructor(private sessionService: SessionService, private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken: string = this.sessionService.getAccessToken();
    const refreshToken: string = this.sessionService.getRefreshToken();

    if (!accessToken && !refreshToken) {
      return next.handle(request);
    }

    // Request new token if the current one it is expired
    if (this.jwtHelper.isTokenExpired(accessToken) && !this.isRefreshing) {
      this.isRefreshing = true;
      return this.authService.refresh()
        .pipe(concatMap(tokens => {
            console.log('Using new access token for current request');
            this.isRefreshing = false;
            request = this.addToken(request, tokens.accessToken);
            return next.handle(request);
          }));
    }

    const token = request.url.endsWith('/auth/refresh') ? refreshToken : accessToken;
    request = this.addToken(request, token);
    return next.handle(request);
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

}
