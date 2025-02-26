import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventsOrder} from '../../../enums/events-order';

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.css']
})
export class OrderDialogComponent implements OnInit {

  order: EventsOrder;

  constructor(private dialogRef: MatDialogRef<OrderDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: EventsOrder) {

    this.order = data;

  }

  ngOnInit(): void {
  }

  onValidateClicked(): void {
    this.dialogRef.close(this.order);
  }
}
