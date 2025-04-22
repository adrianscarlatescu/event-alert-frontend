import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import {UserLocation} from '../types/user-location';
import {RoleDto} from '../model/role.dto';
import {TypeDto} from '../model/type.dto';
import {SeverityDto} from '../model/severity.dto';
import {StatusDto} from '../model/status.dto';
import {UserDto} from '../model/user.dto';
import {FileService} from './file.service';
import {RoleService} from './role.service';
import {TypeService} from './type.service';
import {SeverityService} from './severity.service';
import {StatusService} from './status.service';
import {UserService} from './user.service';
import {concatMap, tap} from 'rxjs/operators';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {RoleId} from '../enums/id/role-id';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private userLocationSubject: BehaviorSubject<UserLocation> = new BehaviorSubject<UserLocation>(undefined);

  private cachedRoles: RoleDto[];
  private cachedTypes: TypeDto[];
  private cachedSeverities: SeverityDto[];
  private cachedStatuses: StatusDto[];
  private cachedConnectedUser: UserDto;

  private cachedImages: Map<string, SafeUrl> = new Map<string, SafeUrl>();

  constructor(private domSanitizer: DomSanitizer,
              private fileService: FileService,
              private roleService: RoleService,
              private typeService: TypeService,
              private severityService: SeverityService,
              private statusService: StatusService,
              private userService: UserService) {
  }

  public clearStorage(): void {
    localStorage.clear();
  }

  public setAccessToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
  }

  public getAccessToken(): string {
    return localStorage.getItem('accessToken');
  }

  public setRefreshToken(refreshToken: string): void {
    localStorage.setItem('refreshToken', refreshToken);
  }

  public getRefreshToken(): string {
    return localStorage.getItem('refreshToken');
  }

  public setUserLocation(userLocation: UserLocation): void {
    this.userLocationSubject.next(userLocation);
  }

  public getUserLocation(): Observable<UserLocation> {
    return this.userLocationSubject.asObservable();
  }

  public setHomePage(homePage: string): void {
    localStorage.setItem('homePage', homePage);
  }

  public getHomePage(): string {
    return localStorage.getItem('homePage');
  }

  public isConnectedUserAdmin(): boolean {
    return this.cachedConnectedUser.roles.map(role => role.id).includes(RoleId.ROLE_ADMIN);
  }

  public getRoles(): RoleDto[] {
    return this.cachedRoles;
  }

  public getTypes(): TypeDto[] {
    return this.cachedTypes;
  }

  public getSeverities(): SeverityDto[] {
    return this.cachedSeverities;
  }

  public getStatuses(): StatusDto[] {
    return this.cachedStatuses;
  }

  public getConnectedUser(): UserDto {
    return this.cachedConnectedUser;
  }

  public getImage(imagePath: string): SafeUrl {
    return this.cachedImages.get(imagePath);
  }

  public setConnectedUser(user: UserDto): void {
    this.cachedConnectedUser = user;
  }

  // Sync

  public sync(): Observable<any[]> {
    const rolesObservable = this.roleService.getRoles()
      .pipe(tap(roles => this.cachedRoles = roles));

    const typesObservable = this.typeService.getTypes()
      .pipe(tap(types => this.cachedTypes = types))
      .pipe(concatMap(types => {
        return forkJoin(types.map(type => {
          return this.fileService.getImage(type.imagePath)
            .pipe(tap(blob => {
              const url: string = URL.createObjectURL(blob);
              this.cachedImages.set(type.imagePath, this.domSanitizer.bypassSecurityTrustUrl(url));
            }));
        }));
      }));

    const severitiesObservable = this.severityService.getSeverities()
      .pipe(tap(severities => this.cachedSeverities = severities));

    const statusesObservable = this.statusService.getStatuses()
      .pipe(tap(statuses => this.cachedStatuses = statuses));

    const userObservable = this.userService.getProfile()
      .pipe(tap(user => this.cachedConnectedUser = user));

    return forkJoin([
      rolesObservable,
      typesObservable,
      severitiesObservable,
      statusesObservable,
      userObservable
    ]);
  }

}
