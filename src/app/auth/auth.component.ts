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
import {JWT_OFFSET_SECONDS} from '../defaults/constants';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  jwtHelper: JwtHelperService = new JwtHelperService();

  readonly errMsgMandatoryField: string = 'Field required';
  readonly errMsgInvalidEmail: string = 'Invalid email';
  readonly errMsgPasswordLength: string = 'The length must have between 8 and 40 characters';
  readonly errMsgDifferentPasswords: string = 'The passwords do not match';

  loginForm: FormGroup;
  registerForm: FormGroup;
  hidePassword: boolean = true;
  returnUrl: string;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
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

    this.activatedRoute.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'];
    });

  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40)]],
    });

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40)]]
    }, {
      validators: [PasswordValidator.validate]
    });
  }

  getLoginEmailErrorMessage(): string {
    if (this.loginForm.get('email').hasError('required')) {
      return this.errMsgMandatoryField;
    }
    return this.loginForm.get('email').hasError('email') ? this.errMsgInvalidEmail : '';
  }

  getLoginPasswordErrorMessage(): string {
    if (this.loginForm.get('password').hasError('required')) {
      return this.errMsgMandatoryField;
    }
    return this.loginForm.get('password').hasError('minlength') ||
    this.loginForm.get('password').hasError('maxlength') ? this.errMsgPasswordLength : '';
  }

  getRegisterEmailErrorMessage(): string {
    if (this.registerForm.get('email').hasError('required')) {
      return this.errMsgMandatoryField;
    }
    return this.registerForm.get('email').hasError('email') ? this.errMsgInvalidEmail : '';
  }

  getRegisterPasswordErrorMessage(): string {
    if (this.registerForm.get('password').hasError('required')) {
      return this.errMsgMandatoryField;
    }
    return this.registerForm.get('password').hasError('minlength') ||
    this.registerForm.get('password').hasError('maxlength') ? this.errMsgPasswordLength : '';
  }

  getRegisterConfirmPasswordErrorMessage(): string {
    if (this.registerForm.get('confirmPassword').hasError('required')) {
      return this.errMsgMandatoryField;
    }
    if (this.registerForm.get('confirmPassword').hasError('minlength') ||
      this.registerForm.get('confirmPassword').hasError('maxlength')) {
      return this.errMsgPasswordLength;
    }
    return this.registerForm.get('confirmPassword').hasError('not_the_same').valueOf() ? this.errMsgDifferentPasswords : '';
  }

  onLogin(): Subscription {
    if (this.loginForm.valid) {
      this.spinnerService.show();

      const loginRequest: LoginRequest = new LoginRequest();
      loginRequest.email = this.loginForm.value.email;
      loginRequest.password = this.loginForm.value.password;

      return this.authService.login(loginRequest)
        .pipe(concatMap(tokens => {
          this.sessionService.setTokens(tokens);
          return this.sessionService.sync();
        }))
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
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({not_the_same: true});
      return ({not_the_same: true});
    }
    return null;
  }
}

