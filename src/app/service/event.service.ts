import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EventDto} from '../model/event.dto';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {PageDto} from '../model/page.dto';
import {Order} from '../enums/order';
import {EventCreateDto} from '../model/event-create.dto';
import {EventFilterDto} from '../model/event-filter.dto';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private http: HttpClient) {
  }

  getEventById(id: number): Observable<EventDto> {
    return this.http.get<EventDto>(`${baseUrl}/events/${id}`);
  }

  getEventsByUserId(userId: number): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(`${baseUrl}/events`, {params: {'userId': userId.toString()}});
  }

  postEvent(eventCreate: EventCreateDto): Observable<EventDto> {
    return this.http.post<EventDto>(`${baseUrl}/events`, eventCreate);
  }

  getEventsByFilter(eventFilter: EventFilterDto, pageSize: number, pageNumber: number, order: Order): Observable<PageDto<EventDto>> {
    return this.http.post<PageDto<EventDto>>(`${baseUrl}/events/filter`, eventFilter,
      {
        params: {
          'pageSize': pageSize.toString(),
          'pageNumber': pageNumber.toString(),
          'order': order.toString()
        }
      });
  }

}
