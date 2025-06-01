import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {TypeDto} from '../model/type.dto';

@Injectable({
  providedIn: 'root'
})
export class TypeService {

  constructor(private http: HttpClient) {
  }

  getTypes(): Observable<TypeDto[]> {
    return this.http.get<TypeDto[]>(`${baseUrl}/types`);
  }

}
