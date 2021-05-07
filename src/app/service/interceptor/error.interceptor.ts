import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

import {Observable, throwError} from 'rxjs';

import {catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {defaultError} from '../../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toast: ToastrService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((errorResponse: HttpErrorResponse) => {
          let errorMessage = `${defaultError}`;
          if (errorResponse.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = errorResponse.error.message;

          } else {
            // server-side error
            errorMessage = this.getErrorMessage(errorResponse);
          }
          console.log(errorResponse);
          this.toast.error(errorMessage);
          return throwError(errorMessage);
        }));
  }

  getErrorMessage(errorResponse: HttpErrorResponse): string {
    const apiErrors: DefaultApiError = errorResponse.error;
    if (apiErrors.errors !== undefined) {
      return apiErrors.errors[0].code + ': ' + apiErrors.errors[0].message;
    }
    const springError: DefaultError = errorResponse.error;
    if (springError.status !== undefined && springError.message !== undefined) {
      return springError.status + ': ' + springError.message;
    }
    return errorResponse.message;
  }
}

export class DefaultError {
  error: string;
  message: string;
  path: string;
  status: number;
  timestamp: string;
}

export class DefaultApiError {
  errors: ApiError[];
}

export class ApiError {
  code: string;
  message: string;
}
