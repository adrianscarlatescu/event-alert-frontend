import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {StatusDto} from '../model/status.dto';
import {GenderDto} from '../model/gender.dto';

@Injectable({
  providedIn: 'root'
})
export class GenderService {

  constructor(private http: HttpClient) {
  }

  getGenders(): Observable<GenderDto[]> {
    return this.http.get<GenderDto[]>(`${baseUrl}/genders`);
  }

}
