import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Event} from '../model/event';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {NewEventBody} from './body/new.event.body';
import {EventFilterBody} from './body/event.filter.body';
import {Order} from '../model/order';
import {Page} from '../model/page';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private http: HttpClient) {
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${baseUrl}/events/${id}`);
  }

  getByUserId(userId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${baseUrl}/events`, {params: {'userId': userId.toString()}});
  }

  postEvent(body: NewEventBody): Observable<Event> {
    return this.http.post<Event>(`${baseUrl}/events`, body);
  }

  getByFilter(body: EventFilterBody, pageSize: number, pageNumber: number, order: Order): Observable<Page<Event>> {
    return this.http.post<Page<Event>>(`${baseUrl}/events/filter`, body,
      {
        params: {
          'pageSize': pageSize.toString(),
          'pageNumber': pageNumber.toString(),
          'order': order.toString()
        }
      });
  }

}
