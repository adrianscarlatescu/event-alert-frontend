import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {AuthService} from '../service/auth.service';
import {Router} from '@angular/router';
import {SessionService} from '../service/session.service';
import {ToastrService} from 'ngx-toastr';
import {CustomReuseStrategy} from './common/custom.reuse.strategy';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

  @ViewChild(MatSidenav) sidenav: MatSidenav;

  isUserAdmin: boolean = false;
  geoWatchId: number;

  constructor(private authService: AuthService,
              private sessionService: SessionService,
              private toast: ToastrService,
              private router: Router) {

    this.isUserAdmin = this.sessionService.isUserAdmin();

  }

  ngOnInit(): void {
    navigator.permissions.query({
      name: 'geolocation'
    }).then(result => {
      if (result.state == 'granted' || result.state == 'prompt') {
        this.geoWatchId = navigator.geolocation.watchPosition(
          position => {
            const latitude: number = position.coords.latitude;
            const longitude: number = position.coords.longitude;
            this.sessionService.setUserLatitude(latitude);
            this.sessionService.setUserLongitude(longitude);
            console.log('Location updated');
          },
          positionError => {
            console.log(positionError);
            this.toast.error('Could not retrieve your location');
          });
      } else if (result.state == 'denied') {
        this.toast.warning('Allow access to your location in order to find and report events');
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

  onCreator(): void {
    this.router.navigate(['/creator']);
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
        const reuseStrategy: CustomReuseStrategy = this.router.routeReuseStrategy as CustomReuseStrategy;
        reuseStrategy.routesToCache = [];
        reuseStrategy.storedRouteHandles.clear();
        this.router.navigate(['/auth']);
      });
  }

}
