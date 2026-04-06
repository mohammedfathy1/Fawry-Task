import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingListService } from '../../core/services/shopping-list.service';
import { ShoppingItem } from '../../core/models/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h2>My Shopping List</h2>
        <p class="subtitle">{{ items.length }} item(s) in your cart</p>
      </div>
      <button class="btn btn-danger btn-sm" *ngIf="items.length > 0"
              (click)="confirmClear()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/></svg>
        Clear All
      </button>
    </div>

    <div *ngIf="loading" class="spinner"></div>

    <div *ngIf="!loading && items.length === 0" class="empty-state">
      <div class="icon">🛒</div>
      <p>Your shopping list is empty</p>
      <a class="btn btn-primary" routerLink="/products" style="margin-top:16px">Browse Products</a>
    </div>

    <div *ngIf="!loading && items.length > 0" class="list-layout">
      <div class="items-section">
        <div class="shopping-item" *ngFor="let item of items">
          <img [src]="item.productThumbnail || 'https://via.placeholder.com/60x60'"
               [alt]="item.productName" class="item-thumb" (error)="onImgError($event)" />
          <div class="item-info">
            <h4>{{ item.productName }}</h4>
            <div class="item-unit">\${{ item.unitPrice | number:'1.2-2' }} each</div>
          </div>
          <div class="item-qty">
            <button class="qty-btn" (click)="updateQty(item, item.quantity - 1)" [disabled]="item.quantity <= 1">−</button>
            <span class="qty-val">{{ item.quantity }}</span>
            <button class="qty-btn" (click)="updateQty(item, item.quantity + 1)">+</button>
          </div>
          <div class="item-total">\${{ item.totalPrice | number:'1.2-2' }}</div>
          <button class="remove-btn" (click)="removeItem(item)" title="Remove">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div class="summary-card card">
        <h3>Order Summary</h3>
        <div class="summary-rows">
          <div class="summary-row" *ngFor="let item of items">
            <span>{{ item.productName }} × {{ item.quantity }}</span>
            <span>\${{ item.totalPrice | number:'1.2-2' }}</span>
          </div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-total">
          <span>Total</span>
          <span class="total-amount">\${{ grandTotal | number:'1.2-2' }}</span>
        </div>
        <button class="btn btn-primary checkout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
          Checkout
        </button>
        <p class="checkout-note">Demo only — no real checkout</p>
      </div>
    </div>

    <!-- Confirm clear modal -->
    <div class="modal-backdrop" *ngIf="showClearModal" (click)="showClearModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Clear Shopping List?</h3>
          <button class="modal-close" (click)="showClearModal=false">✕</button>
        </div>
        <p style="color:var(--text-muted);font-size:14px;">This will remove all {{ items.length }} items from your list.</p>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="showClearModal=false">Cancel</button>
          <button class="btn btn-danger" (click)="clearAll()">Yes, Clear</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .list-layout { display: grid; grid-template-columns: 1fr 320px; gap: 28px; align-items: start; }
    @media (max-width: 768px) { .list-layout { grid-template-columns: 1fr; } }
    .items-section { display: flex; flex-direction: column; gap: 10px; }
    .shopping-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex; align-items: center; gap: 14px;
      transition: border-color .2s;
    }
    .shopping-item:hover { border-color: rgba(245,166,35,.3); }
    .item-thumb { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .item-info { flex: 1; min-width: 0; }
    .item-info h4 { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-unit { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .item-qty { display: flex; align-items: center; gap: 8px; }
    .qty-btn {
      width: 28px; height: 28px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 6px; color: var(--text); font-size: 16px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all .15s;
    }
    .qty-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-val { font-size: 14px; font-weight: 700; min-width: 24px; text-align: center; }
    .item-total { font-size: 15px; font-weight: 700; color: var(--accent); min-width: 70px; text-align: right; }
    .remove-btn {
      background: none; border: none; color: var(--text-muted);
      cursor: pointer; padding: 6px; border-radius: 6px;
      transition: all .15s;
    }
    .remove-btn:hover { background: rgba(231,76,60,.12); color: var(--red); }
    /* Summary */
    .summary-card h3 { font-size: 18px; font-weight: 800; margin-bottom: 20px; }
    .summary-rows { display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow-y: auto; }
    .summary-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); }
    .summary-row span:last-child { color: var(--text); }
    .summary-divider { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
    .summary-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; margin-bottom: 20px; }
    .total-amount { color: var(--accent); font-size: 20px; }
    .checkout-btn { width: 100%; justify-content: center; padding: 12px; font-size: 15px; font-weight: 700; }
    .checkout-note { text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 8px; }
  `]
})
export class ShoppingListComponent implements OnInit {
  items: ShoppingItem[] = [];
  loading = false;
  showClearModal = false;

  get grandTotal() { return this.items.reduce((s, i) => s + i.totalPrice, 0); }

  constructor(private svc: ShoppingListService) {}

  ngOnInit() { this.loadList(); }

  loadList() {
    this.loading = true;
    this.svc.getList().subscribe({
      next: (r) => { this.items = r; this.loading = false; },
      error: () => this.loading = false
    });
  }

  updateQty(item: ShoppingItem, qty: number) {
    if (qty < 1) return;
    this.svc.updateQty(item.id, qty).subscribe(updated => {
      const idx = this.items.findIndex(i => i.id === item.id);
      if (idx >= 0) this.items[idx] = updated;
    });
  }

  removeItem(item: ShoppingItem) {
    this.svc.removeItem(item.id).subscribe(() => {
      this.items = this.items.filter(i => i.id !== item.id);
    });
  }

  confirmClear() { this.showClearModal = true; }

  clearAll() {
    this.svc.clearList().subscribe(() => {
      this.items = [];
      this.showClearModal = false;
    });
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56x56?text=?';
  }
}
