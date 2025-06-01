import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SeverityDto} from '../model/severity.dto';
import {baseUrl} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SeverityService {

  constructor(private http: HttpClient) {
  }

  getSeverities(): Observable<SeverityDto[]> {
    return this.http.get<SeverityDto[]>(`${baseUrl}/severities`);
  }

}
