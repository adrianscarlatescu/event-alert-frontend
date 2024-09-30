import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

import {Observable, throwError} from 'rxjs';

import {catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toast: ToastrService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((errorResponse: HttpErrorResponse) => {
          let errorMessage: string;
          if (errorResponse.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = errorResponse.error.message;
          } else {
            // server-side error
            errorMessage = this.getErrorMessage(errorResponse);
          }

          console.error(errorResponse);
          this.toast.error(errorMessage, '',{enableHtml: true});
          return throwError(errorMessage);
        }));
  }

  getErrorMessage(errorResponse: HttpErrorResponse): string {
    if (errorResponse && errorResponse.error) {
      const apiFailure: ApiFailure = errorResponse.error;

      if (apiFailure.errors !== undefined && apiFailure.errors.length > 0) {
        let apiErrorMessage: string = '';
        for (let i = 0; i < apiFailure.errors.length; i++) {
          apiErrorMessage += apiFailure.errors[i].message;
          if (i < apiFailure.errors.length - 1) {
            apiErrorMessage += '<hr/>';
          }
        }
        return apiErrorMessage;
      }

    }

    return 'An error has occurred';
  }
}

export class ApiFailure {
  errors: ApiError[];
}

export class ApiError {
  code: string;
  message: string;
}
