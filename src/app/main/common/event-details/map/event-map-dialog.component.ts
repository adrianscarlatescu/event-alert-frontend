import {Component, Inject, OnInit} from '@angular/core';
import {mapTheme} from '../../map.style';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {EventDto} from '../../../../model/event.dto';
import {SessionService} from '../../../../service/session.service';
import {SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-event-map-dialog',
  templateUrl: './event-map-dialog.component.html',
  styleUrls: ['./event-map-dialog.component.css']
})
export class EventMapDialogComponent implements OnInit {

  mapStyle = mapTheme;
  zoom: number;

  constructor(private sessionService: SessionService,
              @Inject(MAT_DIALOG_DATA) public event: EventDto) {

    const impactRadius = event.impactRadius;
    if (!impactRadius) {
      this.zoom = 14;
      return;
    }

    this.zoom = Math.max(2.5, 14.5 - Math.log(this.event.impactRadius) / Math.log(2));
  }

  ngOnInit(): void {
  }

  getImage(imagePath: string): SafeUrl {
    return this.sessionService.getImage(imagePath);
  }

}
