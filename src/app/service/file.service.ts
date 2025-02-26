import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {baseUrl} from '../../environments/environment';
import {ImageType} from '../enums/image-type';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) {
  }

  getImage(imagePath: string): Observable<Blob> {
    return this.http.get(`${baseUrl}/images`, {params: {path: imagePath}, responseType: 'blob'});
  }

  postImage(image: File, imageType: ImageType): Observable<object> {
    const formData: FormData = new FormData();
    formData.append('image', image);
    return this.http.post(`${baseUrl}/images`, formData, {
      params: {
        'type': imageType
      }
    });
  }

}

