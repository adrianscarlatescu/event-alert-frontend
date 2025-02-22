import {Injectable} from '@angular/core';
import {UserDto} from '../model/user.dto';
import {FileService} from './file.service';
import {EMPTY, forkJoin, from, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {UserService} from './user.service';
import {TypeService} from './type.service';
import {SeverityService} from './severity.service';
import {SeverityDto} from '../model/severity.dto';
import {TypeDto} from '../model/type.dto';
import {StatusDto} from '../model/status.dto';
import {StatusService} from './status.service';
import {GenderService} from './gender.service';
import {GenderDto} from '../model/gender.dto';
import {RoleService} from './role.service';
import {RoleDto} from '../model/role.dto';
import {CategoryService} from './category.service';
import {CategoryDto} from '../model/category.dto';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private fileService: FileService,
              private genderService: GenderService,
              private roleService: RoleService,
              private userService: UserService,
              private categoryService: CategoryService,
              private typeService: TypeService,
              private severityService: SeverityService,
              private statusService: StatusService) {
  }

  public setGenders(genders: GenderDto[]) {
    localStorage.setItem('genders', JSON.stringify(genders));
  }

  public getGenders(): GenderDto[] {
    return JSON.parse(localStorage.getItem('genders'));
  }

  public setRoles(roles: RoleDto[]) {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  public getRoles(): RoleDto[] {
    return JSON.parse(localStorage.getItem('roles'));
  }

  public setUser(user: UserDto) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUser(): UserDto {
    return JSON.parse(localStorage.getItem('user'));
  }

  public isUserAdmin(): boolean {
    return this.getUser().roles.map(role => role.id).includes('ROLE_ADMIN');
  }

  public setUserLatitude(latitude: number) {
    localStorage.setItem('userLatitude', latitude.toString());
  }

  public getUserLatitude(): number {
    return +localStorage.getItem('userLatitude');
  }

  public setUserLongitude(longitude: number) {
    localStorage.setItem('userLongitude', longitude.toString());
  }

  public getUserLongitude(): number {
    return +localStorage.getItem('userLongitude');
  }

  public setCategories(categories: CategoryDto[]) {
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  public getCategories(): CategoryDto[] {
    return JSON.parse(localStorage.getItem('types'));
  }

  public setTypes(types: TypeDto[]) {
    localStorage.setItem('types', JSON.stringify(types));
  }

  public getTypes(): TypeDto[] {
    return JSON.parse(localStorage.getItem('types'));
  }

  public setSeverities(severities: SeverityDto[]) {
    localStorage.setItem('severities', JSON.stringify(severities));
  }

  public getSeverities(): SeverityDto[] {
    return JSON.parse(localStorage.getItem('severities'));
  }

  public setStatuses(status: StatusDto[]) {
    localStorage.setItem('statuses', JSON.stringify(status));
  }

  public getStatuses(): StatusDto[] {
    return JSON.parse(localStorage.getItem('statuses'));
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

  public setCacheImage(url: string, b64blob: string | ArrayBuffer) {
    localStorage.setItem(url, JSON.stringify(b64blob));
  }

  public getCacheImageByUrl(url: string): string | ArrayBuffer {
    return JSON.parse(localStorage.getItem(url));
  }

  public setHomePage(homePage: string): void {
    localStorage.setItem('homePage', homePage);
  }

  public getHomePage(): string {
    return localStorage.getItem('homePage');
  }

  public sync(): Observable<any[]> {
    const gendersObservable: Observable<void> = this.genderService.getGenders()
      .pipe(map(genders => {
        this.setGenders(genders);
      }));

    const rolesObservable: Observable<void> = this.roleService.getRoles()
      .pipe(map(roles => {
        this.setRoles(roles);
      }));

    const userObservable: Observable<void> = this.userService.getProfile()
      .pipe(map(user => {
        this.setUser(user);
      }));

    const categoriesObservable: Observable<void> = this.categoryService.getCategories()
      .pipe(map(categories => {
        this.setCategories(categories);
      }));

    const typesObservable: Observable<void> = this.typeService.getTypes()
      .pipe(mergeMap(types => {
        this.setTypes(types);

        return from(types)
          .pipe(mergeMap((type) => {
            if (type.imagePath) {
              return this.fileService.getImage(type.imagePath)
                .pipe(map(blob => {
                  const reader: FileReader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onloadend = () => {
                    this.setCacheImage(type.imagePath, reader.result);
                  };
                }));
            } else {
              return EMPTY;
            }
          }));
      }));

    const severitiesObservable: Observable<void> = this.severityService.getSeverities()
      .pipe(map(severities => {
        this.setSeverities(severities);
      }));

    const statusesObservable: Observable<void> = this.statusService.getStatuses()
      .pipe(map(statuses => {
        this.setStatuses(statuses);
      }));

    return forkJoin([
      rolesObservable,
      gendersObservable,
      userObservable,
      categoriesObservable,
      typesObservable,
      severitiesObservable,
      statusesObservable
    ]);
  }

  public clearStorage(): void {
    localStorage.clear();
  }

}
