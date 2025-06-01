import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {AuthService} from '../service/auth.service';
import {ActivatedRoute, DetachedRouteHandle, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {JwtHelperService} from '@auth0/angular-jwt';
import {SessionService} from '../service/session.service';
import {CustomReuseStrategy} from '../main/common/custom.reuse.strategy';
import {JWT_OFFSET_SECONDS, LENGTH_50, LENGTH_8} from '../defaults/constants';
import {
  ERR_MSG_CONFIRMATION_PASSWORD_REQUIRED,
  ERR_MSG_DIFFERENT_PASSWORDS,
  ERR_MSG_EMAIL_LENGTH,
  ERR_MSG_EMAIL_REQUIRED,
  ERR_MSG_INVALID_EMAIL,
  ERR_MSG_PASSWORD_LENGTH,
  ERR_MSG_PASSWORD_REQUIRED
} from '../defaults/field-validation-messages';
import {AuthLoginDto} from '../model/auth-login.dto';
import {AuthRegisterDto} from '../model/auth-register.dto';
import {SpinnerService} from '../service/spinner.service';
import {AuthTabIndex} from '../enums/auth-tab-index';

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
  syncError: boolean = false;
  selectedTabIndex: AuthTabIndex = AuthTabIndex.LOGIN;

  constructor(activatedRoute: ActivatedRoute,
              private sessionService: SessionService,
              private authService: AuthService,
              private spinnerService: SpinnerService,
              private toastrService: ToastrService,
              private formBuilder: FormBuilder,
              private router: Router) {

    this.returnUrl = activatedRoute.snapshot.queryParams['returnUrl'];
    this.syncError = activatedRoute.snapshot.queryParams['syncError'];

  }

  ngOnInit(): void {
    const accessToken = this.sessionService.getAccessToken();
    const refreshToken = this.sessionService.getRefreshToken();

    if (!this.syncError && accessToken && refreshToken && !this.jwtHelper.isTokenExpired(refreshToken, JWT_OFFSET_SECONDS)) {
      console.log('Valid tokens, redirect /home');
      this.router.navigate(['/home']);
    } else {
      localStorage.clear();

      this.loginForm = this.formBuilder.group({
        email: [undefined, [Validators.required, Validators.email]],
        password: [undefined, [Validators.required]],
      });

      this.registerForm = this.formBuilder.group({
        email: [undefined, [Validators.required, Validators.email, Validators.maxLength(LENGTH_50)]],
        password: [undefined, [Validators.required, Validators.minLength(LENGTH_8), Validators.maxLength(LENGTH_50)]],
        confirmPassword: [undefined, [Validators.required, Validators.minLength(LENGTH_8), Validators.maxLength(LENGTH_50)]]
      }, {
        validators: [PasswordValidator.validate]
      });
    }
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

      const authLogin: AuthLoginDto = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }

      return this.authService.login(authLogin)
        .subscribe(() => {
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

      const authRegister: AuthRegisterDto = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword
      }

      return this.authService.register(authRegister)
        .subscribe(user => {
          this.toastrService.success('Registration successful');
          this.spinnerService.close();
          this.selectedTabIndex = AuthTabIndex.LOGIN;
          this.loginForm.get('email').setValue(authRegister.email);
          this.loginForm.get('password').setValue(authRegister.password);
        }, () => this.spinnerService.close());
    }
  }

}

class PasswordValidator {
  static validate(control: AbstractControl): ValidationErrors | null {
    const password: string = control.get('password')?.value;
    const confirmPassword: string = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      control.get('confirmPassword')?.setErrors(null);
      return null;
    }

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({not_the_same: true});
      return ({not_the_same: true});
    }

    control.get('confirmPassword')?.setErrors(null);
    return null;
  }

}

