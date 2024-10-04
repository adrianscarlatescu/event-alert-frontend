import {Component, OnInit} from '@angular/core';
import {SessionService} from '../../../service/session.service';
import {mapTheme} from '../../common/map.style';
import {Event} from '../../../model/event';
import {Router} from '@angular/router';
import {FileService} from '../../../service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {interval, Subscription} from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  mapStyle = mapTheme;
  zoom: number = 13;
  map: google.maps.Map;

  events: Event[];

  selectedEvent: Event;
  selectedEventImage: SafeUrl;

  constructor(private router: Router,
              private domSanitizer: DomSanitizer,
              private fileService: FileService,
              public sessionService: SessionService) {

  }

  ngOnInit(): void {
  }

  setDefaultViewValues(): void {
    this.zoom = 15;
    this.map.panTo({lat: this.sessionService.getUserLatitude(), lng: this.sessionService.getUserLongitude()});
  }

  mapReady(map: google.maps.Map): void {
    this.map = map;
  }

  zoomChange(value: number): void {
    this.zoom = value;
  }

  onMarkerClicked(event: Event): void {
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

  public setEvents(events: Event[]): void {
    this.events = events;

    if (this.events.length === 0) {
      return;
    }

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

      this.map.panTo({lat: this.sessionService.getUserLatitude(), lng: this.sessionService.getUserLongitude()});

    }, 500);
  }

}
