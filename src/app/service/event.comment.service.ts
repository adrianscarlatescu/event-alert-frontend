import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {EventComment} from '../model/event.comment';
import {baseUrl} from '../../environments/environment';
import {EventCommentRequest} from '../model/request/event.comment.request';

@Injectable({
  providedIn: 'root'
})
export class EventCommentService {

  constructor(private http: HttpClient) {
  }

  getCommentsByEventId(eventId: number): Observable<EventComment[]> {
    return this.http.get<EventComment[]>(`${baseUrl}/comments/${eventId}`);
  }

  postComment(commentRequest: EventCommentRequest): Observable<EventComment> {
    return this.http.post<EventComment>(`${baseUrl}/comments`, commentRequest);
  }

}
