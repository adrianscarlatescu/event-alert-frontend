import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate('250ms ease-in', style({transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        style({transform: 'translateX(0%)'}),
        animate('250ms ease-in', style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class ModalComponent implements OnInit {

  slideInOut: boolean;

  @Input() showButtons: boolean = true;
  @Input() title: string;

  @Output() onValidate: EventEmitter<void> = new EventEmitter<void>();

  constructor(private dialogRef: MatDialogRef<ModalComponent>) {
  }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    setTimeout(() => this.slideInOut = true, 0);
  }

  validate(): void {
    this.onValidate.next();
  }

  close(): void {
    this.slideInOut = false;
    setTimeout(() => this.dialogRef.close(), 250);
  }

}
