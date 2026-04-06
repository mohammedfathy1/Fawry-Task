import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Meal } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MealService {
  private base = `${environment.apiUrl}/admin/meals`;
  constructor(private http: HttpClient) {}

  search(query: string) {
    return this.http.get<Meal[]>(`${this.base}/search`, { params: new HttpParams().set('query', query) });
  }

  getCategories() {
    return this.http.get<string[]>(`${this.base}/categories`);
  }

  getByCategory(category: string) {
    return this.http.get<Meal[]>(`${this.base}/by-category`, { params: new HttpParams().set('category', category) });
  }

  getById(id: string) {
    return this.http.get<Meal>(`${this.base}/${id}`);
  }
}
