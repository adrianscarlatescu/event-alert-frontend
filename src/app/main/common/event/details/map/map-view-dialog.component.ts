import {Component, Inject, OnInit} from '@angular/core';
import {mapTheme} from '../../../map.style';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-map-view-dialog',
  templateUrl: './map-view-dialog.component.html',
  styleUrls: ['./map-view-dialog.component.css']
})
export class MapViewDialogComponent implements OnInit {

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
  tagImage: string;
  severityColor: string;
}
