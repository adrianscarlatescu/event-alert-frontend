import {Component, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {SpinnerService} from '../../service/spinner.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {

  isFirstSubscription: boolean = true;
  isShown: boolean = false;
  isFadeIn: boolean = false;

  constructor(private spinnerService: SpinnerService) {
  }

  ngOnInit(): void {
    this.spinnerService.getSpinner().subscribe(isShown => {
      if (this.isFirstSubscription) {
        this.isFirstSubscription = false;
        return;
      }

      if (isShown) {
        this.isShown = isShown;
        setTimeout(() => this.isFadeIn = true, 0);
      } else {
        setTimeout(() => this.isFadeIn = false, 500);
        setTimeout(() => this.isShown = isShown, 1000);
      }
    });
  }

}

export const simpleFadeAnimation = trigger('simpleFadeAnimation', [
  state('in', style({opacity: 1})),

  transition(':enter', [
    style({opacity: 0}),
    animate(1000 )
  ]),

  transition(':leave',
    animate(1000, style({opacity: 0})))
]);
