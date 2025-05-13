import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {SessionService} from '../../../service/session.service';
import {mapTheme} from '../../common/map.style';
import {EventDto} from '../../../model/event.dto';
import {Router} from '@angular/router';
import {FileService} from '../../../service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {UserLocation} from '../../../types/user-location';

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

  maxDistance: number;

  selectedEvent: EventDto;
  selectedEventImage: SafeUrl;

  userLocation: UserLocation;

  constructor(private sessionService: SessionService,
              private fileService: FileService,
              private domSanitizer: DomSanitizer,
              private router: Router) {

  }

  ngOnInit(): void {
    this.sessionService.getUserLocation().subscribe(userLocation => this.userLocation = userLocation);
  }

  ngOnChanges(): void {
    this.selectedEvent = undefined;
    if (!this.events || this.events.length === 0) {
      return;
    }

    const distances: number[] = this.events.map(event => event.distance);
    const originalMaxDistance = Math.max(...distances);
    this.maxDistance = originalMaxDistance + originalMaxDistance * 0.05; // 5% error margin

    setTimeout(() => {
      this.zoom = Math.max(2.5, 14.5 - Math.log(this.maxDistance) / Math.log(2));

      if (this.userLocation.latitude && this.userLocation.longitude) {
        this.map.panTo({lat: this.userLocation.latitude, lng: this.userLocation.longitude});
      }
    }, 500);
  }

  getImage(imagePath: string): SafeUrl {
    return this.sessionService.getImage(imagePath);
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
