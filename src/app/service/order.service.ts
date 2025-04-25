import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {baseUrl} from '../../environments/environment';
import {OrderDto} from '../model/order.dto';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {
  }

  getOrders(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(`${baseUrl}/orders`);
  }

}
