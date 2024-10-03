import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {AuthService} from '../auth.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {concatMap} from 'rxjs/operators';
import {SessionService} from '../session.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {JWT_OFFSET_SECONDS, LOGIN_URL_REGEX, REFRESH_URL_REGEX, REGISTER_URL_REGEX} from '../../defaults/constants';
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
    const url: string = request.url;

    if (url.match(LOGIN_URL_REGEX) || url.match(REGISTER_URL_REGEX)) {
      return next.handle(request);
    }

    const accessToken: string = this.sessionService.getAccessToken();
    const refreshToken: string = this.sessionService.getRefreshToken();

    if (!accessToken || !refreshToken) {
      this.toast.warning('Authorization tokens required, please re-login');
      this.clearAndRedirect();
      return of();
    }

    const isAccessTokenExpired: boolean = this.jwtHelper.isTokenExpired(accessToken, JWT_OFFSET_SECONDS);
    const isRefreshTokenExpired: boolean = this.jwtHelper.isTokenExpired(refreshToken, JWT_OFFSET_SECONDS);

    if (url.match(REFRESH_URL_REGEX)) {
      if (isRefreshTokenExpired) {
        this.toast.warning('Authorization expired, please re-login');
        this.clearAndRedirect();
        return of();
      }
      request = this.createRequestWithAuthHeader(request, refreshToken);
      return next.handle(request);
    }

    if (isAccessTokenExpired) {
      return this.authService.refresh()
        .pipe(concatMap(tokens => {
          console.log('Using new access token for current request');
          request = this.createRequestWithAuthHeader(request, tokens.accessToken);
          return next.handle(request);
        }));
    }

    request = this.createRequestWithAuthHeader(request, accessToken);
    return next.handle(request);
  }

  private createRequestWithAuthHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private clearAndRedirect(): void {
    localStorage.clear();
    this.spinnerService.close();
    this.router.navigate(['/auth'], {queryParams: {returnUrl: this.router.routerState.snapshot.url}});
  }

}
