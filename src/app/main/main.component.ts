import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {AuthService} from '../service/auth.service';
import {Router} from '@angular/router';
import {SessionService} from '../service/session.service';
import {ToastrService} from 'ngx-toastr';
import {CustomReuseStrategy} from './common/custom.reuse.strategy';
import {SpinnerService} from '../service/spinner.service';
import {catchError, tap} from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

  @ViewChild(MatSidenav) sidenav: MatSidenav;

  isDataSynced: boolean = false;
  isConnectedUserAdmin: boolean = false;
  geoWatchId: number;

  constructor(private sessionService: SessionService,
              private authService: AuthService,
              private spinnerService: SpinnerService,
              private toastrService: ToastrService,
              private router: Router) {

  }

  ngOnInit(): void {
    this.spinnerService.show();
    this.sessionService.sync()
      .pipe(
        tap(() => {
          console.log('Server sync completed');
          this.spinnerService.close();
          this.isDataSynced = true;
          this.isConnectedUserAdmin = this.sessionService.isConnectedUserAdmin();
          this.initLocation();
        }),
        catchError(() => {
          this.spinnerService.close();
          return this.authService.logout()
            .pipe(tap(() => {
              console.error('Server sync error, redirect /auth');
              this.clearCache();
              this.router.navigate(['/auth'], {queryParams: {syncError: true}});
            }));
        }))
      .subscribe();
  }

  initLocation(): void {
    navigator.permissions.query({
      name: 'geolocation'
    }).then(result => {
      if (result.state == 'granted' || result.state == 'prompt') {
        this.geoWatchId = navigator.geolocation.watchPosition(
          position => {
            const latitude: number = position.coords.latitude;
            const longitude: number = position.coords.longitude;
            this.sessionService.setUserLocation({latitude, longitude});
            console.log('Location updated');
          },
          positionError => {
            console.error(positionError);
            this.toastrService.error('Could not retrieve your location');
          });
      } else if (result.state == 'denied') {
        this.toastrService.warning('Allow access to your location in order to find and report events');
      }
    });
  }

  ngOnDestroy(): void {
    navigator.geolocation.clearWatch(this.geoWatchId);
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  onHome(): void {
    this.router.navigate(['/home']);
  }

  onReporter(): void {
    this.router.navigate(['/reporter']);
  }

  onNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  onProfile(): void {
    this.router.navigate(['/profile']);
  }

  onAdmin(): void {
    this.router.navigate(['/admin']);
  }

  onLogout(): void {
    this.authService.logout()
      .subscribe(() => {
        this.clearCache();
        this.router.navigate(['/auth']);
      });
  }

  clearCache(): void {
    const reuseStrategy: CustomReuseStrategy = this.router.routeReuseStrategy as CustomReuseStrategy;
    reuseStrategy.routesToCache = [];
    reuseStrategy.storedRouteHandles.clear();
    this.sessionService.clearStorage();
  }

}
