import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private spinnerSubject = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  getSpinner(): Observable<boolean> {
    return this.spinnerSubject;
  }

  show(): void {
    this.spinnerSubject.next(true);
  }

  close(): void {
    this.spinnerSubject.next(false);
  }

}
