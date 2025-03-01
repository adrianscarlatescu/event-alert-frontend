import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {UserLocation} from '../types/user-location';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private userLocationSubject: BehaviorSubject<UserLocation> = new BehaviorSubject<UserLocation>(undefined);

  constructor() {
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

  public getHomePage(): string | null {
    return localStorage.getItem('homePage');
  }

  // ###

  public sync(): Observable<any[]> {
    console.log('syncccc');
    return of([]);
  }

  public clearStorage(): void {
    localStorage.clear();
  }

}
