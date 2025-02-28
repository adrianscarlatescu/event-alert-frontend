import {Injectable} from '@angular/core';
import {FileService} from './file.service';
import {BehaviorSubject, EMPTY, forkJoin, from, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {TypeService} from './type.service';
import {SeverityService} from './severity.service';
import {SeverityDto} from '../model/severity.dto';
import {TypeDto} from '../model/type.dto';
import {StatusDto} from '../model/status.dto';
import {StatusService} from './status.service';
import {UserLocation} from '../types/user-location';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private userLocationSubject: BehaviorSubject<UserLocation> = new BehaviorSubject<UserLocation>(undefined);

  constructor(private fileService: FileService,
              private typeService: TypeService,
              private severityService: SeverityService,
              private statusService: StatusService) {
  }


  public setAccessToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  public setRefreshToken(refreshToken: string): void {
    localStorage.setItem('refreshToken', refreshToken);
  }

  public getRefreshToken(): string | null {
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

  public getHomePage(): string | null {
    return localStorage.getItem('homePage');
  }

  // ###

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


  public setCacheImage(url: string, b64blob: string | ArrayBuffer) {
    localStorage.setItem(url, JSON.stringify(b64blob));
  }

  public getCacheImageByUrl(url: string): string | ArrayBuffer {
    return JSON.parse(localStorage.getItem(url));
  }

  public sync(): Observable<any[]> {

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
      typesObservable,
      severitiesObservable,
      statusesObservable
    ]);
  }

  public clearStorage(): void {
    localStorage.clear();
  }

}
