import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {StatusDto} from '../model/status.dto';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(private http: HttpClient) {
  }

  getStatuses(): Observable<StatusDto[]> {
    return this.http.get<StatusDto[]>(`${baseUrl}/statuses`);
  }

}
