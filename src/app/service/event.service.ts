import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EventDto} from '../model/event.dto';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {PageDto} from '../model/page.dto';
import {EventCreateDto} from '../model/event-create.dto';
import {FilterDto} from '../model/filter.dto';
import {OrderId} from '../enums/id/order-id';

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

  getEventsByFilter(filter: FilterDto, pageSize: number, pageNumber: number, orderId: OrderId): Observable<PageDto<EventDto>> {
    return this.http.post<PageDto<EventDto>>(`${baseUrl}/events/filter`, filter,
      {
        params: {
          'pageSize': pageSize.toString(),
          'pageNumber': pageNumber.toString(),
          'orderId': orderId.toString()
        }
      });
  }

}
