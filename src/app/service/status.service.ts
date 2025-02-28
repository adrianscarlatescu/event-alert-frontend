import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {StatusDto} from '../model/status.dto';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private cachedStatuses: StatusDto[];

  constructor(private http: HttpClient) {
  }

  getStatuses(): Observable<StatusDto[]> {
    if (this.cachedStatuses) {
      return of(this.cachedStatuses);
    }
    return this.http.get<StatusDto[]>(`${baseUrl}/statuses`)
      .pipe(tap(statuses => this.cachedStatuses = statuses));
  }

}
