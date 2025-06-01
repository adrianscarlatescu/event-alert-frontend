import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {baseUrl} from '../../environments/environment';
import {ImageType} from '../enums/image-type';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private cachedImages: Map<string, Blob> = new Map<string, Blob>();

  constructor(private http: HttpClient) {
  }

  getImage(imagePath: string): Observable<Blob> {
    if (this.cachedImages.has(imagePath)) {
      return of(this.cachedImages.get(imagePath));
    }
    return this.getImageObservable(imagePath);
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

  private getImageObservable(imagePath: string): Observable<Blob> {
    return this.http.get(`${baseUrl}/images`, {params: {path: imagePath}, responseType: 'blob'});
  }

}

