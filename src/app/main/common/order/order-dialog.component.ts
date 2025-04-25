import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {Subject} from 'rxjs';
import {OrderDto} from '../../../model/order.dto';
import {SessionService} from '../../../service/session.service';
import {SafeUrl} from '@angular/platform-browser';
import {OrderId} from '../../../enums/id/order-id';

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.css']
})
export class OrderDialogComponent implements OnInit {

  @ViewChild(ModalComponent) modal: ModalComponent;

  onValidate: Subject<OrderId> = new Subject<OrderId>();

  orders: OrderDto[];

  selectedOrderId: OrderId;

  constructor(private sessionService: SessionService,
              @Inject(MAT_DIALOG_DATA) selectedOrderId: OrderId) {
    this.selectedOrderId = selectedOrderId;
  }

  ngOnInit(): void {
    this.orders = this.sessionService.getEventOrders();
  }

  getImage(imagePath: string): SafeUrl {
    return this.sessionService.getImage(imagePath);
  }

  getArrowIcon(order: OrderDto): string {
    if (order.id.toString().endsWith('ASCENDING')) {
      return 'arrow_upward';
    }
    if (order.id.toString().endsWith('DESCENDING')) {
      return 'arrow_downward';
    }
  }

  onValidateClicked(): void {
    this.onValidate.next(this.selectedOrderId);
  }

  close(): void {
    this.modal.close();
  }

}
