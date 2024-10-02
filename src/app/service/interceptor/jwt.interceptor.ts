import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {AuthService} from '../auth.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {concatMap} from 'rxjs/operators';
import {SessionService} from '../session.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {JWT_OFFSET_SECONDS} from '../../defaults/constants';
import {SpinnerService} from '../../shared/spinner/spinner.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(private router: Router,
              private toast: ToastrService,
              private spinnerService: SpinnerService,
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

    const isAccessTokenExpired: boolean = this.jwtHelper.isTokenExpired(accessToken, JWT_OFFSET_SECONDS);
    const isRefreshTokenExpired: boolean = this.jwtHelper.isTokenExpired(refreshToken, JWT_OFFSET_SECONDS);

    if (!isAccessTokenExpired && !isRefreshTokenRequest) {
      request = this.addTokenHeader(request, accessToken);
      return next.handle(request);
    }

    if (!isRefreshTokenExpired && isRefreshTokenRequest) {
      request = this.addTokenHeader(request, refreshToken);
      return next.handle(request);
    }

    if (isAccessTokenExpired && !isRefreshTokenExpired) {
      return this.authService.refresh()
        .pipe(concatMap(tokens => {
          console.log('Using new access token for current request');
          request = this.addTokenHeader(request, tokens.accessToken);
          return next.handle(request);
        }));
    }

    if (isRefreshTokenExpired) {
      localStorage.clear();
      this.spinnerService.close();
      this.toast.warning('Authorization expired, please re-login');
      this.router.navigate(['/auth'], {queryParams: {returnUrl: this.router.routerState.snapshot.url}});
    }

    return of();
  }

  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

}
