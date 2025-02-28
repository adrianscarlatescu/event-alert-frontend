import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {TypeDto} from '../model/type.dto';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TypeService {

  private cachedTypes: TypeDto[];

  constructor(private http: HttpClient) {
  }

  getTypes(): Observable<TypeDto[]> {
    if (this.cachedTypes) {
      return of(this.cachedTypes);
    }
    return this.http.get<TypeDto[]>(`${baseUrl}/types`)
      .pipe(tap(types => this.cachedTypes = types));
  }

}
