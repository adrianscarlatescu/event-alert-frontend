import {Component, Inject, OnInit} from '@angular/core';
import {mapTheme} from '../map.style';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-event-map-dialog',
  templateUrl: './event-map-dialog.component.html',
  styleUrls: ['./event-map-dialog.component.css']
})
export class EventMapDialogComponent implements OnInit {

  mapStyle = mapTheme;
  mapZoom: number = 14;


  constructor(@Inject(MAT_DIALOG_DATA) public data: MapViewData) {
  }

  ngOnInit(): void {
  }

}

class MapViewData {
  latitude: number;
  longitude: number;
  typeImage: string;
  severityColor: string;
}
