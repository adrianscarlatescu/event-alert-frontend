import {Component, OnInit} from '@angular/core';
import {SessionService} from '../../../service/session.service';
import {mapTheme} from '../../common/map.style';
import {Event} from '../../../model/event';
import {Router} from '@angular/router';
import {FileService} from '../../../service/file.service';
import {DomSanitizer} from '@angular/platform-browser';
import {interval, Subscription} from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  mapStyle = mapTheme;
  zoom = 13;
  map: google.maps.Map;

  events: Event[];

  selectedEvent: Event;
  selectedEventImage;

  constructor(private router: Router,
              private domSanitizer: DomSanitizer,
              private fileService: FileService,
              public sessionService: SessionService) {

  }

  ngOnInit(): void {
  }

  setDefaultViewValues() {
    this.zoom = 15;
    this.map.panTo({lat: this.sessionService.getUserLatitude(), lng: this.sessionService.getUserLongitude()});
  }

  mapReady(map: google.maps.Map) {
    this.map = map;
  }

  zoomChange(value: number) {
    this.zoom = value;
  }

  onMarkerClicked(event: Event) {
    this.map.panTo({lat: event.latitude, lng: event.longitude});

    this.selectedEvent = event;
    this.fileService.getImage(event.imagePath)
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        this.selectedEventImage = this.domSanitizer.bypassSecurityTrustUrl(url);
      });
  }

  onEventInfoViewClicked() {
    this.router.navigate(['event/details'], {state: {id: this.selectedEvent.id}});
  }

  onEventInfoCloseClicked() {
    setTimeout(() => {
      this.selectedEvent = null;
    }, 250);
  }

  public setEvents(events: Event[]) {
    this.events = events;

    if (this.events.length === 0) {
      return;
    }

    const distances: number[] = this.events.map(event => event.distance);
    const radius = Math.max(...distances);

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
