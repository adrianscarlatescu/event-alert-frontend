import {Injectable} from '@angular/core';
import {User} from '../model/user';
import {FileService} from './file.service';
import {EMPTY, forkJoin, from, Observable} from 'rxjs';
import {concatMap, map, mergeMap} from 'rxjs/operators';
import {UserService} from './user.service';
import {EventTagService} from './event.tag.service';
import {EventSeverityService} from './event.severity.service';
import {EventTag} from '../model/event.tag';
import {EventSeverity} from '../model/event.severity';
import {Token} from '../model/token';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private fileService: FileService,
              private userService: UserService,
              private tagService: EventTagService,
              private severityService: EventSeverityService) {
  }

  public setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUser(): User {
    return JSON.parse(localStorage.getItem('user'));
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

  public setTags(tags: EventTag[]) {
    localStorage.setItem('tags', JSON.stringify(tags));
  }

  public getTags(): EventTag[] {
    return JSON.parse(localStorage.getItem('tags'));
  }

  public setSeverities(severities: EventSeverity[]) {
    localStorage.setItem('severities', JSON.stringify(severities));
  }

  public getSeverities(): EventSeverity[] {
    return JSON.parse(localStorage.getItem('severities'));
  }

  public setTokens(token: Token): void {
    localStorage.setItem('accessToken', token.accessToken);
    localStorage.setItem('refreshToken', token.refreshToken);
  }

  public getAccessToken(): string {
    return localStorage.getItem('accessToken');
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

  public setHomePage(homePage: string) {
    localStorage.setItem('homePage', homePage);
  }

  public getHomePage() {
    return localStorage.getItem('homePage');
  }

  public sync(): Observable<any[]> {
    const userObs = this.userService.getProfile()
      .pipe(map(user => {
        this.setUser(user);
      }));

    const tagsObs = this.tagService.getTags()
      .pipe(mergeMap(tags => {
        this.setTags(tags);

        return from(tags)
          .pipe(mergeMap((tag) => {
            if (tag.imagePath) {
              return this.fileService.getImage(tag.imagePath)
                .pipe(map(blob => {
                  const reader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onloadend = () => {
                    this.setCacheImage(tag.imagePath, reader.result);
                  };
                }));
            } else {
              return EMPTY;
            }
          }));
      }));

    const severitiesObs = this.severityService.getSeverities()
      .pipe(map(severities => {
        this.setSeverities(severities);
      }));

    return forkJoin([userObs, tagsObs, severitiesObs]);
  }

  public clearStorage() {
    localStorage.clear();
  }

}
