import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {EventTag} from '../model/event.tag';

@Injectable({
  providedIn: 'root'
})
export class EventTagService {

  constructor(private http: HttpClient) {
  }

  getTags(): Observable<EventTag[]> {
    return this.http.get<EventTag[]>(`${baseUrl}/tags`);
  }

}
