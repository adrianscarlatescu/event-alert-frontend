import {Component, OnInit} from '@angular/core';
import {SpinnerService} from './spinner.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

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
    this.spinnerService.getSpinnerObserver().subscribe((isShown) => {
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

  // the "in" style determines the "resting" state of the element when it is visible.
  state('in', style({opacity: 1})),

  // fade in when created. this could also be written as transition('void => *')
  transition(':enter', [
    style({opacity: 0}),
    animate(1000 )
  ]),

  // fade out when destroyed. this could also be written as transition('void => *')
  transition(':leave',
    animate(1000, style({opacity: 0})))
]);
