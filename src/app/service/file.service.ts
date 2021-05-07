import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {baseUrl} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) {
  }

  getImage(imagePath: string): Observable<Blob> {
    return this.http.get(`${baseUrl}/image`, {params: {path: imagePath}, responseType: 'blob'});
  }

  postImage(image: File, type: string): Observable<object> {
    const formData: FormData = new FormData();
    formData.append('image', image, type);
    return this.http.post(`${baseUrl}/image`, formData);
  }

}

