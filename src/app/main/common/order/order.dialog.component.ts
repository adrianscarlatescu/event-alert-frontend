import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Order} from '../../../model/order';

@Component({
  selector: 'app-order.dialog',
  templateUrl: './order.dialog.component.html',
  styleUrls: ['./order.dialog.component.css']
})
export class OrderDialogComponent implements OnInit {

  order: Order;

  constructor(private dialogRef: MatDialogRef<OrderDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: Order) {

    this.order = data;

  }

  ngOnInit(): void {
  }

  onValidateClicked() {
    this.dialogRef.close(this.order);
  }
}
