import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private spinner = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  getSpinner(): Observable<boolean> {
    return this.spinner;
  }

  show(): void {
    this.spinner.next(true);
  }

  close(): void {
    this.spinner.next(false);
  }

}
