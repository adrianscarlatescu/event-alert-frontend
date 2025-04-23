import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {EventsOrder} from '../../../enums/events-order';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.css']
})
export class OrderDialogComponent implements OnInit {

  @ViewChild(ModalComponent) modal: ModalComponent;

  onValidate: Subject<EventsOrder> = new Subject<EventsOrder>();

  order: EventsOrder;

  constructor(@Inject(MAT_DIALOG_DATA) order: EventsOrder) {
    this.order = order;
  }

  ngOnInit(): void {
  }

  onValidateClicked(): void {
    this.onValidate.next(this.order);
  }

  close(): void {
    this.modal.close();
  }

}
