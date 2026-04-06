import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ShoppingListService } from '../../core/services/shopping-list.service';
import { Product } from '../../core/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Grocery Catalog</h2>
        <p class="subtitle">{{ totalElements }} approved items available</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" [(ngModel)]="searchName" (input)="onSearch()"
               placeholder="Search products..." class="search-input" />
      </div>
      <select [(ngModel)]="searchCategory" (change)="load(0)" class="cat-select">
        <option value="">All Categories</option>
        <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
      </select>
    </div>

    <!-- Grid -->
    <div *ngIf="loading" class="spinner"></div>
    <div *ngIf="!loading && products.length === 0" class="empty-state">
      <div class="icon">🥦</div>
      <p>No products found</p>
    </div>

    <div class="products-grid" *ngIf="!loading && products.length > 0">
      <div class="product-card" *ngFor="let p of products">
        <div class="product-thumb">
          <img [src]="p.thumbnail || 'https://via.placeholder.com/200x140?text=No+Image'"
               [alt]="p.name" (error)="onImgError($event)" />
          <div class="product-calories" *ngIf="p.calories">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1010 10"/><path d="M12 6v6l4 2"/></svg>
            {{ p.calories | number:'1.0-0' }} cal
          </div>
        </div>
        <div class="product-body">
          <div class="product-category">{{ p.category }}</div>
          <h4 class="product-name">{{ p.name }}</h4>
          <div class="product-meta">
            <span class="product-area" *ngIf="p.area">{{ p.area }}</span>
            <span class="product-brand" *ngIf="p.brand">{{ p.brand }}</span>
          </div>
        </div>
        <div class="product-footer">
          <div class="product-price">\${{ p.estimatedPrice | number:'1.2-2' }}</div>
          <div class="qty-control">
            <button class="qty-btn" (click)="decreaseQty(p.id)">−</button>
            <span class="qty-val">{{ getQty(p.id) }}</span>
            <button class="qty-btn" (click)="increaseQty(p.id)">+</button>
          </div>
          <button class="btn btn-primary btn-sm add-btn"
                  [disabled]="getQty(p.id) === 0 || addingId === p.id"
                  (click)="addToCart(p)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Add
          </button>
        </div>
        <div class="added-toast" *ngIf="addedId === p.id">✓ Added!</div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" *ngIf="totalPages > 1">
      <button (click)="load(currentPage - 1)" [disabled]="currentPage === 0">‹ Prev</button>
      <button *ngFor="let i of pageRange()"
              [class.active]="i === currentPage"
              (click)="load(i)">{{ i + 1 }}</button>
      <button (click)="load(currentPage + 1)" [disabled]="currentPage >= totalPages - 1">Next ›</button>
    </div>

    <!-- Success alert -->
    <div class="floating-alert" *ngIf="cartMsg">{{ cartMsg }}</div>
  `,
  styles: [`
    .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .filter-bar {
      display: flex; gap: 12px; margin-bottom: 28px;
      flex-wrap: wrap;
    }
    .search-wrap {
      position: relative; flex: 1; min-width: 200px;
    }
    .search-icon {
      position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
      color: var(--text-muted); pointer-events: none;
    }
    .search-input {
      width: 100%; background: var(--surface);
      border: 1px solid var(--border); border-radius: 8px;
      padding: 10px 14px 10px 38px;
      color: var(--text); font-size: 14px; transition: border-color .2s;
    }
    .search-input:focus { outline: none; border-color: var(--accent); }
    .cat-select {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 10px 14px;
      color: var(--text); font-size: 14px; cursor: pointer; min-width: 160px;
    }
    .cat-select:focus { outline: none; border-color: var(--accent); }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .product-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      display: flex; flex-direction: column;
      transition: border-color .2s, transform .2s;
      position: relative;
    }
    .product-card:hover { border-color: rgba(245,166,35,.4); transform: translateY(-2px); }
    .product-thumb {
      position: relative; overflow: hidden;
      height: 150px; background: var(--surface2);
    }
    .product-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
    .product-card:hover .product-thumb img { transform: scale(1.05); }
    .product-calories {
      position: absolute; top: 8px; right: 8px;
      background: rgba(0,0,0,.7); backdrop-filter: blur(4px);
      color: var(--accent); font-size: 11px; font-weight: 600;
      padding: 3px 8px; border-radius: 20px;
      display: flex; align-items: center; gap: 4px;
    }
    .product-body { padding: 14px 14px 8px; flex: 1; }
    .product-category {
      font-size: 11px; font-weight: 600; letter-spacing: .06em;
      text-transform: uppercase; color: var(--accent); margin-bottom: 4px;
    }
    .product-name { font-size: 15px; font-weight: 700; margin-bottom: 6px; line-height: 1.3; }
    .product-meta { display: flex; gap: 6px; flex-wrap: wrap; }
    .product-area, .product-brand {
      font-size: 11px; color: var(--text-muted);
      background: var(--surface2); padding: 2px 8px; border-radius: 4px;
    }
    .product-footer {
      padding: 10px 14px 14px;
      display: flex; align-items: center; gap: 8px;
    }
    .product-price { font-size: 16px; font-weight: 700; color: var(--accent); flex: 1; }
    .qty-control { display: flex; align-items: center; gap: 6px; }
    .qty-btn {
      width: 26px; height: 26px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 6px; color: var(--text); font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all .15s;
    }
    .qty-btn:hover { border-color: var(--accent); color: var(--accent); }
    .qty-val { font-size: 14px; font-weight: 600; min-width: 18px; text-align: center; }
    .add-btn { padding: 7px 12px; }
    .added-toast {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(46,204,113,.15);
      border: 2px solid var(--green);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: var(--green); font-size: 18px;
      pointer-events: none;
      animation: toastFade 1.5s forwards;
    }
    @keyframes toastFade {
      0% { opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; }
    }
    .floating-alert {
      position: fixed; bottom: 24px; right: 24px;
      background: var(--green); color: #000;
      padding: 12px 20px; border-radius: 10px;
      font-weight: 600; font-size: 14px;
      animation: slideInRight .3s;
      z-index: 999;
    }
    @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  loading = false;
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  searchName = '';
  searchCategory = '';
  quantities: Record<number, number> = {};
  addingId: number | null = null;
  addedId:  number | null = null;
  cartMsg = '';
  private searchTimer: any;

  constructor(
    private productSvc: ProductService,
    private cartSvc: ShoppingListService
  ) {}

  ngOnInit() {
    this.load(0);
    this.loadCategories();
  }

  load(page: number) {
    this.loading = true;
    this.currentPage = page;
    this.productSvc.getApproved(page, 12, this.searchName, this.searchCategory).subscribe({
      next: (r) => {
        this.products = r.content;
        this.totalElements = r.totalElements;
        this.totalPages = r.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadCategories() {
    // We'll derive categories from products after first load
    this.productSvc.getApproved(0, 100).subscribe(r => {
      const cats = new Set(r.content.map(p => p.category).filter(Boolean));
      this.categories = Array.from(cats).sort();
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(0), 400);
  }

  getQty(id: number) { return this.quantities[id] || 0; }
  increaseQty(id: number) { this.quantities[id] = (this.quantities[id] || 0) + 1; }
  decreaseQty(id: number) { if ((this.quantities[id] || 0) > 0) this.quantities[id]--; }

  addToCart(p: Product) {
    const qty = this.getQty(p.id);
    if (!qty) return;
    this.addingId = p.id;
    this.cartSvc.addItem(p.id, qty).subscribe({
      next: () => {
        this.addedId = p.id;
        this.quantities[p.id] = 0;
        this.cartMsg = `${p.name} added to cart!`;
        this.addingId = null;
        setTimeout(() => { this.addedId = null; }, 1500);
        setTimeout(() => { this.cartMsg = ''; }, 2500);
      },
      error: () => this.addingId = null
    });
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x140?text=No+Image';
  }

  pageRange() {
    const pages = [];
    const start = Math.max(0, this.currentPage - 2);
    const end   = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
