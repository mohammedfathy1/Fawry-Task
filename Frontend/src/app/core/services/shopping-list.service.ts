import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ShoppingItem } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private base = `${environment.apiUrl}/shopping-list`;
  constructor(private http: HttpClient) {}

  getList()                { return this.http.get<ShoppingItem[]>(this.base); }

  addItem(productId: number, quantity: number) {
    return this.http.post<ShoppingItem>(this.base, { productId, quantity });
  }

  updateQty(id: number, quantity: number) {
    return this.http.put<ShoppingItem>(`${this.base}/${id}`,  null,
      { params: new HttpParams().set('quantity', quantity) });
  }

  removeItem(id: number) { return this.http.delete(`${this.base}/${id}`); }
  clearList()            { return this.http.delete(this.base); }
}
