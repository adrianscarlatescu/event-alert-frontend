import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {OrderCode} from '../../../enums/order-code';

@Component({
  selector: 'app-order.dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.css']
})
export class OrderDialogComponent implements OnInit {

  orderCode: OrderCode;

  constructor(private dialogRef: MatDialogRef<OrderDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: OrderCode) {

    this.orderCode = data;

  }

  ngOnInit(): void {
  }

  onValidateClicked(): void {
    this.dialogRef.close(this.orderCode);
  }
}
