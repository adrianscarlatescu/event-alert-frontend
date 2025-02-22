import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CommentDto} from '../model/comment.dto';
import {baseUrl} from '../../environments/environment';
import {CommentCreateDto} from '../model/comment-create.dto';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) {
  }

  getCommentsByEventId(eventId: number): Observable<CommentDto[]> {
    return this.http.get<CommentDto[]>(`${baseUrl}/comments/${eventId}`);
  }

  postComment(commentCreate: CommentCreateDto): Observable<CommentDto> {
    return this.http.post<CommentDto>(`${baseUrl}/comments`, commentCreate);
  }

}
