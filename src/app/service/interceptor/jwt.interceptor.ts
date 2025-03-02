import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {AuthService} from '../auth.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {concatMap} from 'rxjs/operators';
import {SessionService} from '../session.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {JWT_OFFSET_SECONDS, LOGIN_URL_REGEX, REFRESH_TOKEN_URL_REGEX, REGISTER_URL_REGEX} from '../../defaults/constants';
import {SpinnerService} from '../spinner.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(private sessionService: SessionService,
              private authService: AuthService,
              private spinnerService: SpinnerService,
              private toastrService: ToastrService,
              private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const method: string = request.method;
    const url: string = request.url;

    const isLoginRequest: boolean = 'POST' == method && LOGIN_URL_REGEX.test(url);
    const isRegisterRequest: boolean = 'POST' == method && REGISTER_URL_REGEX.test(url);
    const isRefreshTokenRequest: boolean = 'GET' == method && REFRESH_TOKEN_URL_REGEX.test(url);

    if (isLoginRequest || isRegisterRequest) {
      return next.handle(request);
    }

    const accessToken: string = this.sessionService.getAccessToken();
    const refreshToken: string = this.sessionService.getRefreshToken();

    if (!accessToken || !refreshToken) {
      this.toastrService.warning('Authorization tokens required, please re-login');
      this.clearAndRedirect();
      return of();
    }

    const isAccessTokenExpired: boolean = this.jwtHelper.isTokenExpired(accessToken, JWT_OFFSET_SECONDS);
    const isRefreshTokenExpired: boolean = this.jwtHelper.isTokenExpired(refreshToken, JWT_OFFSET_SECONDS);

    if (isRefreshTokenRequest) {
      if (isRefreshTokenExpired) {
        this.toastrService.warning('Authorization expired, please re-login');
        this.clearAndRedirect();
        return of();
      }
      request = this.createRequestWithAuthHeader(request, refreshToken);
      return next.handle(request);
    }

    if (isAccessTokenExpired) {
      return this.authService.refresh()
        .pipe(concatMap(authTokensDto => {
          console.log('Using new access token for current request');
          request = this.createRequestWithAuthHeader(request, authTokensDto.accessToken);
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
