import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {EventSeverity} from '../model/event.severity';
import {baseUrl} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventSeverityService {

  constructor(private http: HttpClient) { }

  getSeverities(): Observable<EventSeverity[]> {
    return this.http.get<EventSeverity[]>(`${baseUrl}/severities`);
  }

}
