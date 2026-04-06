import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Product Management</h2>
        <p class="subtitle">{{ totalElements }} total products (including unapproved)</p>
      </div>
      <button class="btn btn-primary btn-sm" (click)="openCreateModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Product
      </button>
    </div>

    <!-- Filter -->
    <div class="filter-bar">
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" [(ngModel)]="searchName" (input)="onSearch()" placeholder="Search..." class="search-input" />
      </div>
      <select [(ngModel)]="filterStatus" (change)="load(0)" class="cat-select">
        <option value="">All Status</option>
        <option value="approved">Approved Only</option>
        <option value="unapproved">Unapproved Only</option>
      </select>
    </div>

    <div *ngIf="loading" class="spinner"></div>

    <div class="table-wrap" *ngIf="!loading">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Calories</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filteredProducts">
            <td>
              <div class="product-cell">
                <img [src]="p.thumbnail || 'https://via.placeholder.com/40'" [alt]="p.name"
                     class="cell-thumb" (error)="onImgError($event)" />
                <span class="cell-name">{{ p.name }}</span>
              </div>
            </td>
            <td><span class="badge badge-amber" *ngIf="p.category">{{ p.category }}</span></td>
            <td style="color:var(--text-muted);font-size:13px">{{ p.brand || '—' }}</td>
            <td style="font-weight:600;color:var(--accent)">\${{ p.estimatedPrice | number:'1.2-2' }}</td>
            <td style="color:var(--text-muted);font-size:13px">{{ p.calories ? (p.calories | number:'1.0-0') + ' cal' : '—' }}</td>
            <td>
              <span class="badge" [class.badge-green]="p.approved" [class.badge-red]="!p.approved">
                {{ p.approved ? '✓ Approved' : '✗ Pending' }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <button class="btn btn-ghost btn-sm" (click)="openEdit(p)" title="Edit">✎</button>
                <button class="btn btn-success btn-sm" *ngIf="!p.approved" (click)="toggleApprove(p)">Approve</button>
                <button class="btn btn-ghost btn-sm"   *ngIf="p.approved"  (click)="toggleApprove(p)">Unpublish</button>
                <button class="btn btn-danger btn-sm" (click)="confirmDelete(p)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="filteredProducts.length === 0">
            <td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No products found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" *ngIf="totalPages > 1">
      <button (click)="load(currentPage - 1)" [disabled]="currentPage === 0">‹</button>
      <button *ngFor="let i of pageRange()" [class.active]="i === currentPage" (click)="load(i)">{{ i + 1 }}</button>
      <button (click)="load(currentPage + 1)" [disabled]="currentPage >= totalPages - 1">›</button>
    </div>

    <!-- Edit/Create Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="showModal=false">
      <div class="modal" style="width:560px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingId ? 'Edit Product' : 'Create Product' }}</h3>
          <button class="modal-close" (click)="showModal=false">✕</button>
        </div>
        <div class="form-grid">
          <div class="input-group span-2">
            <label>Name *</label>
            <input type="text" [(ngModel)]="form.name" placeholder="Product name" />
          </div>
          <div class="input-group">
            <label>Category</label>
            <input type="text" [(ngModel)]="form.category" placeholder="e.g. Chicken" />
          </div>
          <div class="input-group">
            <label>Area / Origin</label>
            <input type="text" [(ngModel)]="form.area" placeholder="e.g. Italian" />
          </div>
          <div class="input-group">
            <label>Brand</label>
            <input type="text" [(ngModel)]="form.brand" placeholder="e.g. Fawry Grocery" />
          </div>
          <div class="input-group">
            <label>Price ($)</label>
            <input type="number" [(ngModel)]="form.estimatedPrice" step="0.01" min="0" />
          </div>
          <div class="input-group">
            <label>Calories</label>
            <input type="number" [(ngModel)]="form.calories" step="1" min="0" />
          </div>
          <div class="input-group span-2">
            <label>Thumbnail URL</label>
            <input type="text" [(ngModel)]="form.thumbnail" placeholder="https://..." />
          </div>
          <div class="input-group span-2">
            <label>Nutrients (JSON)</label>
            <textarea [(ngModel)]="form.nutrients" rows="2" placeholder='{"protein":"10g","carbs":"30g"}'></textarea>
          </div>
          <div class="input-group span-2 approve-toggle">
            <label class="toggle-row">
              <input type="checkbox" [(ngModel)]="form.approved" />
              <span>Approve immediately</span>
            </label>
          </div>
        </div>
        <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="showModal=false">Cancel</button>
          <button class="btn btn-primary" (click)="saveProduct()" [disabled]="saving">
            {{ saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Create') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div class="modal-backdrop" *ngIf="deleteTarget" (click)="deleteTarget=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Delete Product?</h3>
          <button class="modal-close" (click)="deleteTarget=null">✕</button>
        </div>
        <p style="color:var(--text-muted);font-size:14px">
          Are you sure you want to permanently delete <strong>{{ deleteTarget?.name }}</strong>?
          This cannot be undone.
        </p>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="deleteTarget=null">Cancel</button>
          <button class="btn btn-danger" (click)="deleteProduct()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-wrap { position: relative; flex: 1; min-width: 200px; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
    .search-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px 10px 38px; color: var(--text); font-size: 14px; }
    .search-input:focus { outline: none; border-color: var(--accent); }
    .cat-select { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text); font-size: 14px; }
    .product-cell { display: flex; align-items: center; gap: 10px; }
    .cell-thumb { width: 38px; height: 38px; border-radius: 6px; object-fit: cover; }
    .cell-name { font-weight: 600; font-size: 14px; }
    .action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
    .approve-toggle .toggle-row { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  searchName = '';
  filterStatus = '';
  showModal = false;
  deleteTarget: Product | null = null;
  editingId: number | null = null;
  saving = false;
  formError = '';
  form: Partial<Product> = {};
  private searchTimer: any;

  get filteredProducts() {
    return this.products.filter(p => {
      if (this.filterStatus === 'approved')   return p.approved;
      if (this.filterStatus === 'unapproved') return !p.approved;
      return true;
    });
  }

  constructor(private svc: ProductService) {}
  ngOnInit() { this.load(0); }

  load(page: number) {
    this.loading = true; this.currentPage = page;
    this.svc.adminGetAll(page, 15, this.searchName).subscribe({
      next: r => { this.products = r.content; this.totalElements = r.totalElements; this.totalPages = r.totalPages; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSearch() { clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => this.load(0), 400); }

  openCreateModal() {
    this.editingId = null;
    this.form = { approved: false, estimatedPrice: 9.99, calories: 350 };
    this.formError = '';
    this.showModal = true;
  }

  openEdit(p: Product) {
    this.editingId = p.id;
    this.form = { ...p };
    this.formError = '';
    this.showModal = true;
  }

  saveProduct() {
    if (!this.form.name) { this.formError = 'Name is required'; return; }
    this.saving = true; this.formError = '';
    const obs = this.editingId
      ? this.svc.update(this.editingId, this.form)
      : this.svc.createCustom(this.form);
    obs.subscribe({
      next: () => { this.showModal = false; this.saving = false; this.load(this.currentPage); },
      error: (e) => { this.formError = e.error?.message || 'Save failed'; this.saving = false; }
    });
  }

  toggleApprove(p: Product) {
    const obs = p.approved ? this.svc.unapprove(p.id) : this.svc.approve(p.id);
    obs.subscribe(updated => {
      const idx = this.products.findIndex(x => x.id === p.id);
      if (idx >= 0) this.products[idx] = updated;
    });
  }

  confirmDelete(p: Product) { this.deleteTarget = p; }

  deleteProduct() {
    if (!this.deleteTarget) return;
    this.svc.delete(this.deleteTarget.id).subscribe(() => {
      this.products = this.products.filter(p => p.id !== this.deleteTarget!.id);
      this.deleteTarget = null;
      this.totalElements--;
    });
  }

  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/38'; }

  pageRange() {
    const pages = []; const start = Math.max(0, this.currentPage - 2); const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i); return pages;
  }
}
