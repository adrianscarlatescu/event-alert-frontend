import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SessionService} from '../../../service/session.service';
import {mapTheme} from '../../common/map.style';
import {EventDto} from '../../../model/event.dto';
import {Router} from '@angular/router';
import {FileService} from '../../../service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {forkJoin, interval, Subscription} from 'rxjs';
import {UserLocation} from '../../../types/user-location';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-events-map',
  templateUrl: './events-map.component.html',
  styleUrls: ['./events-map.component.css']
})
export class EventsMapComponent implements OnInit, OnChanges {

  mapStyle = mapTheme;
  zoom: number = 13;
  map: google.maps.Map;

  @Input()
  events: EventDto[];
  @Input()
  filterRadius: number;

  selectedEvent: EventDto;
  selectedEventImage: SafeUrl;

  userLocation: UserLocation;

  typeImages: Map<string, SafeUrl> = new Map<string, SafeUrl>();

  constructor(private router: Router,
              private domSanitizer: DomSanitizer,
              private fileService: FileService,
              public sessionService: SessionService) {

  }

  ngOnInit(): void {
    this.sessionService.getUserLocation().subscribe(userLocation => this.userLocation = userLocation);
  }

  ngOnChanges(): void {
    this.selectedEvent = undefined;
    if (!this.events || this.events.length === 0) {
      return;
    }

    forkJoin(this.events
      .map(event => event.type.imagePath)
      .filter((value, index, array) => array.indexOf(value) === index)
      .map(imagePath => {
        return this.fileService.getImage(imagePath)
          .pipe(tap(blob => {
            const url: string = URL.createObjectURL(blob);
            this.typeImages.set(imagePath, this.domSanitizer.bypassSecurityTrustUrl(url));
          }));
      }))
      .subscribe();

    const distances: number[] = this.events.map(event => event.distance);
    const radius: number = Math.max(...distances);

    setTimeout(() => {

      const targetZoom: number = 15.5 - Math.log(radius) / Math.log(2);
      const intervalSub: Subscription = interval(500).subscribe(() => {

        if (targetZoom - this.zoom >= 2) {
          this.zoom += 2;
        } else if (this.zoom - targetZoom >= 2) {
          this.zoom -= 2;
        } else if (targetZoom - this.zoom >= 1) {
          this.zoom += 1;
        } else if (this.zoom - targetZoom >= 1) {
          this.zoom -= 1;
        } else {
          intervalSub.unsubscribe();
        }

      });

      if (this.userLocation.latitude && this.userLocation.longitude) {
        this.map.panTo({lat: this.userLocation.latitude, lng: this.userLocation.longitude});
      }

    }, 500);
  }

  setDefaultViewValues(): void {
    if (!this.userLocation.latitude) {
      console.error('Location not provided');
      return;
    }
    this.zoom = 15;
    this.map.panTo({lat: this.userLocation.latitude, lng: this.userLocation.longitude});
  }

  mapReady(map: google.maps.Map): void {
    this.map = map;
  }

  zoomChange(value: number): void {
    this.zoom = value;
  }

  onMarkerClicked(event: EventDto): void {
    this.map.panTo({lat: event.latitude, lng: event.longitude});
    this.map.panBy(0, -230);

    this.selectedEvent = event;
    this.fileService.getImage(event.imagePath)
      .subscribe(blob => {
        const url: string = URL.createObjectURL(blob);
        this.selectedEventImage = this.domSanitizer.bypassSecurityTrustUrl(url);
      });
  }

  onEventInfoViewClicked(): void {
    this.router.navigate(['event', this.selectedEvent.id]);
  }

  onEventInfoCloseClicked(): void {
    setTimeout(() => {
      this.selectedEvent = null;
    }, 250);
  }

}
