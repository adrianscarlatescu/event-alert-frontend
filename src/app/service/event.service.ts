import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Event} from '../model/event';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {Page} from '../model/page';
import {Order} from '../enums/order';
import {EventRequest} from '../model/request/event.request';
import {EventFilterRequest} from '../model/request/event.filter.request';

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

  postEvent(eventRequest: EventRequest): Observable<Event> {
    return this.http.post<Event>(`${baseUrl}/events`, eventRequest);
  }

  getByFilter(filterRequest: EventFilterRequest, pageSize: number, pageNumber: number, order: Order): Observable<Page<Event>> {
    return this.http.post<Page<Event>>(`${baseUrl}/events/filter`, filterRequest,
      {
        params: {
          'pageSize': pageSize.toString(),
          'pageNumber': pageNumber.toString(),
          'order': order.toString()
        }
      });
  }

}
