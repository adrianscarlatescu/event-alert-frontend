import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from '../auth.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {mergeMap} from 'rxjs/operators';
import {SessionService} from '../session.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private jwtHelper: JwtHelperService = new JwtHelperService();
  private isRefreshing = false;

  constructor(private sessionService: SessionService, private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.sessionService.getAccessToken() == null) {
      return next.handle(request);
    }

    // Request new token if the current one it is expired
    if (this.jwtHelper.isTokenExpired(this.sessionService.getAccessToken()) && !this.isRefreshing) {
      this.isRefreshing = true;
      return this.authService.refresh()
        .pipe(
          mergeMap(value => {
            this.isRefreshing = false;
            request = this.addToken(request, value.accessToken);
            return next.handle(request);
          }));
    }

    const token = request.url.endsWith('/auth/refresh') ? this.sessionService.getRefreshToken() : this.sessionService.getAccessToken();
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
