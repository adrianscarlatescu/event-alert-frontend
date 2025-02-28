import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {StatusDto} from '../model/status.dto';
import {GenderDto} from '../model/gender.dto';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GenderService {

  private cachedGenders: GenderDto[];

  constructor(private http: HttpClient) {
  }

  getGenders(): Observable<GenderDto[]> {
    if (this.cachedGenders) {
      return of(this.cachedGenders);
    }
    return this.http.get<GenderDto[]>(`${baseUrl}/genders`)
      .pipe(tap(genders => this.cachedGenders = genders));
  }

}
