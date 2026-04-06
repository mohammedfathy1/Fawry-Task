import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, PageResponse, ImportRequest, BulkImportRequest, BulkImportResult } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Public (user) ──────────────────────────────────────
  getApproved(page = 0, size = 12, name = '', category = '') {
    let params = new HttpParams().set('page', page).set('size', size).set('sortBy', 'name').set('sortDir', 'asc');
    if (name)     params = params.set('name', name);
    if (category) params = params.set('category', category);
    return this.http.get<PageResponse<Product>>(`${this.base}/products`, { params });
  }

  getById(id: number) {
    return this.http.get<Product>(`${this.base}/products/${id}`);
  }

  // ── Admin ──────────────────────────────────────────────
  adminGetAll(page = 0, size = 12, name = '', category = '') {
    let params = new HttpParams().set('page', page).set('size', size).set('sortBy', 'createdAt').set('sortDir', 'desc');
    if (name)     params = params.set('name', name);
    if (category) params = params.set('category', category);
    return this.http.get<PageResponse<Product>>(`${this.base}/admin/products`, { params });
  }

  importMeal(mealId: string, body: ImportRequest) {
    return this.http.post<Product>(`${this.base}/admin/products/import/${mealId}`, body);
  }

  bulkImport(body: BulkImportRequest) {
    return this.http.post<BulkImportResult>(`${this.base}/admin/products/bulk-import`, body);
  }

  createCustom(body: Partial<Product>) {
    return this.http.post<Product>(`${this.base}/admin/products`, body);
  }

  update(id: number, body: Partial<Product>) {
    return this.http.patch<Product>(`${this.base}/admin/products/${id}`, body);
  }

  approve(id: number) {
    return this.http.patch<Product>(`${this.base}/admin/products/${id}/approve`, {});
  }

  unapprove(id: number) {
    return this.http.patch<Product>(`${this.base}/admin/products/${id}/unapprove`, {});
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/admin/products/${id}`);
  }
}
