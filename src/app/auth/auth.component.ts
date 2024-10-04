import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {AuthService} from '../service/auth.service';
import {ActivatedRoute, DetachedRouteHandle, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {JwtHelperService} from '@auth0/angular-jwt';
import {SessionService} from '../service/session.service';
import {CustomReuseStrategy} from '../main/common/custom.reuse.strategy';
import {SpinnerService} from '../shared/spinner/spinner.service';
import {concatMap} from 'rxjs/operators';
import {LoginRequest} from '../model/request/login.request';
import {RegisterRequest} from '../model/request/register.request';
import {JWT_OFFSET_SECONDS, MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH} from '../defaults/constants';
import {
  ERR_MSG_CONFIRMATION_PASSWORD_REQUIRED,
  ERR_MSG_DIFFERENT_PASSWORDS,
  ERR_MSG_EMAIL_LENGTH,
  ERR_MSG_EMAIL_REQUIRED,
  ERR_MSG_INVALID_EMAIL,
  ERR_MSG_PASSWORD_LENGTH,
  ERR_MSG_PASSWORD_REQUIRED
} from '../defaults/field-validation-messages';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  jwtHelper: JwtHelperService = new JwtHelperService();
  loginForm: FormGroup;
  registerForm: FormGroup;
  hidePassword: boolean = true;
  returnUrl: string;

  constructor(activatedRoute: ActivatedRoute,
              private formBuilder: FormBuilder,
              private router: Router,
              private toast: ToastrService,
              private authService: AuthService,
              private spinnerService: SpinnerService,
              private sessionService: SessionService) {

    const accessToken: string = this.sessionService.getAccessToken();
    const refreshToken: string = this.sessionService.getRefreshToken();

    if (accessToken && refreshToken && !this.jwtHelper.isTokenExpired(refreshToken, JWT_OFFSET_SECONDS)) {
      this.spinnerService.show();
      this.sessionService.sync()
        .subscribe(() => {
          console.log('Sync completed');
          this.router.navigate(['/home']);
          this.spinnerService.close();
        }, () => this.spinnerService.close());
    } else {
      localStorage.clear();
    }

    this.returnUrl = activatedRoute.snapshot.queryParams['returnUrl'];

  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [undefined, [Validators.required, Validators.email]],
      password: [undefined, [Validators.required]],
    });

    this.registerForm = this.formBuilder.group({
      email: [undefined, [Validators.required, Validators.email, Validators.maxLength(MAX_EMAIL_LENGTH)]],
      password: [undefined, [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]],
      confirmPassword: [undefined, [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(MAX_PASSWORD_LENGTH)]]
    }, {
      validators: [PasswordValidator.validate]
    });
  }

  getLoginEmailErrorMessage(): string {
    if (this.loginForm.get('email').hasError('required')) {
      return ERR_MSG_EMAIL_REQUIRED;
    }
    if (this.loginForm.get('email').hasError('email')) {
      return ERR_MSG_INVALID_EMAIL;
    }
  }

  getLoginPasswordErrorMessage(): string {
    if (this.loginForm.get('password').hasError('required')) {
      return ERR_MSG_PASSWORD_REQUIRED;
    }
  }

  getRegisterEmailErrorMessage(): string {
    if (this.registerForm.get('email').hasError('required')) {
      return ERR_MSG_EMAIL_REQUIRED;
    }
    if (this.registerForm.get('email').hasError('email')) {
      return ERR_MSG_INVALID_EMAIL;
    }
    if (this.registerForm.get('email').hasError('maxlength')) {
      return ERR_MSG_EMAIL_LENGTH;
    }
  }

  getRegisterPasswordErrorMessage(): string {
    if (this.registerForm.get('password').hasError('required')) {
      return ERR_MSG_PASSWORD_REQUIRED;
    }
    if (this.registerForm.get('password').hasError('minlength') ||
      this.registerForm.get('password').hasError('maxlength')) {
      return ERR_MSG_PASSWORD_LENGTH;
    }
  }

  getRegisterConfirmPasswordErrorMessage(): string {
    if (this.registerForm.get('confirmPassword').hasError('required')) {
      return ERR_MSG_CONFIRMATION_PASSWORD_REQUIRED;
    }
    if (this.registerForm.get('confirmPassword').hasError('not_the_same')) {
      return ERR_MSG_DIFFERENT_PASSWORDS;
    }
  }

  onLogin(): Subscription {
    if (this.loginForm.valid) {
      this.spinnerService.show();

      const loginRequest: LoginRequest = new LoginRequest();
      loginRequest.email = this.loginForm.value.email;
      loginRequest.password = this.loginForm.value.password;

      return this.authService.login(loginRequest)
        .pipe(concatMap(() => this.sessionService.sync()))
        .subscribe(() => {
          console.log('Sync completed');

          const reuseStrategy: CustomReuseStrategy = this.router.routeReuseStrategy as CustomReuseStrategy;
          reuseStrategy.routesToCache = ['home'];
          reuseStrategy.storedRouteHandles = new Map<string, DetachedRouteHandle>();

          this.router.navigate([this.returnUrl ? this.returnUrl : '/home']);
          this.spinnerService.close();
        }, () => this.spinnerService.close());
    }
  }

  onRegister(): Subscription {
    if (this.registerForm.valid) {
      this.spinnerService.show();

      const registerRequest: RegisterRequest = new RegisterRequest();
      registerRequest.email = this.registerForm.value.email;
      registerRequest.password = this.registerForm.value.password;
      registerRequest.confirmPassword = this.registerForm.value.confirmPassword;

      return this.authService.register(registerRequest)
        .subscribe(user => {
          this.toast.success('Registration successful');
          this.spinnerService.close();
        }, () => this.spinnerService.close());
    }
  }

}

class PasswordValidator {
  static validate(control: AbstractControl): ValidationErrors | null {
    const password: string = control.get('password')?.value;
    const confirmPassword: string = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) {
      return null;
    }
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({not_the_same: true});
      return ({not_the_same: true});
    }
    return null;
  }
}

