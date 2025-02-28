import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {CategoryDto} from '../model/category.dto';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private cachedCategories: CategoryDto[];

  constructor(private http: HttpClient) {
  }

  getCategories(): Observable<CategoryDto[]> {
    if (this.cachedCategories) {
      return of(this.cachedCategories);
    }
    return this.http.get<CategoryDto[]>(`${baseUrl}/categories`)
      .pipe(tap(categories => this.cachedCategories = categories));
  }

}
