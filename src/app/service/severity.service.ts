import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SeverityDto} from '../model/severity.dto';
import {baseUrl} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeverityService {

  private cachedSeverities: SeverityDto[];

  constructor(private http: HttpClient) { }

  getSeverities(): Observable<SeverityDto[]> {
    if (this.cachedSeverities) {
      return of(this.cachedSeverities);
    }
    return this.http.get<SeverityDto[]>(`${baseUrl}/severities`)
      .pipe(tap(severities => this.cachedSeverities = severities));
  }

}
