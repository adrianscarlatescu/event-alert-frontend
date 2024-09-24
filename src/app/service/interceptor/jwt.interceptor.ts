import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {AuthService} from '../auth.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {concatMap} from 'rxjs/operators';
import {SessionService} from '../session.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private jwtHelper: JwtHelperService = new JwtHelperService();
  private isRefreshing: boolean = false;

  constructor(private router: Router,
              private toast: ToastrService,
              private sessionService: SessionService,
              private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken: string = this.sessionService.getAccessToken();
    const refreshToken: string = this.sessionService.getRefreshToken();
    const isRefreshTokenRequest: boolean = request.url.endsWith('/auth/refresh');

    if (!accessToken || !refreshToken) {
      return next.handle(request);
    }

    const isAccessTokenExpired: boolean = this.jwtHelper.isTokenExpired(accessToken);
    const isRefreshTokenExpired: boolean = this.jwtHelper.isTokenExpired(refreshToken);

    if (!isAccessTokenExpired && !isRefreshTokenRequest) {
      request = this.addToken(request, accessToken);
      return next.handle(request);
    }

    if (!isRefreshTokenExpired && isRefreshTokenRequest) {
      request = this.addToken(request, refreshToken);
      return next.handle(request);
    }

    // Request new token if the current one it is expired
    if (isAccessTokenExpired && !isRefreshTokenExpired && !this.isRefreshing) {
      this.isRefreshing = true;
      return this.authService.refresh()
        .pipe(concatMap(tokens => {
          console.log('Using new access token for current request');
          this.isRefreshing = false;
          request = this.addToken(request, tokens.accessToken);
          return next.handle(request);
        }));
    }

    if (this.jwtHelper.isTokenExpired(refreshToken)) {
      localStorage.clear();
      this.toast.warning('Authorization expired');
      this.router.navigate(['/auth'], {queryParams: {returnUrl: this.router.routerState.snapshot.url}});
    }

    return of();
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

}
