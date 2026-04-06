import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MealService } from '../../../core/services/meal.service';
import { ProductService } from '../../../core/services/product.service';
import { Meal, ImportRequest } from '../../../core/models/models';

@Component({
  selector: 'app-admin-meals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Browse TheMealDB</h2>
        <p class="subtitle">Search and import meals as grocery products</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" [class.active]="activeTab==='search'" (click)="activeTab='search'">🔍 Search by Name</button>
      <button class="tab" [class.active]="activeTab==='category'" (click)="activeTab='category';loadCategories()">🗂 Browse by Category</button>
      <button class="tab" [class.active]="activeTab==='bulk'" (click)="activeTab='bulk'">📥 Bulk Import</button>
    </div>

    <!-- Search Tab -->
    <div *ngIf="activeTab==='search'" class="tab-content">
      <div class="search-row">
        <div class="search-wrap" style="flex:1">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="search-input" type="text" [(ngModel)]="searchQuery"
                 placeholder="Search meals (e.g. chicken, pasta)..."
                 (keyup.enter)="searchMeals()" />
        </div>
        <button class="btn btn-primary" (click)="searchMeals()" [disabled]="loadingMeals">
          {{ loadingMeals ? 'Searching...' : 'Search' }}
        </button>
      </div>

      <div *ngIf="loadingMeals" class="spinner"></div>
      <div *ngIf="!loadingMeals && meals.length === 0 && searched" class="empty-state">
        <div class="icon">🍽</div>
        <p>No meals found for "{{ searchQuery }}"</p>
      </div>
      <div class="meals-grid" *ngIf="meals.length > 0">
        <ng-container *ngTemplateOutlet="mealCards; context:{meals:meals}"></ng-container>
      </div>
    </div>

    <!-- Category Tab -->
    <div *ngIf="activeTab==='category'" class="tab-content">
      <div class="cat-pills" *ngIf="categories.length > 0">
        <button class="cat-pill" *ngFor="let c of categories"
                [class.active]="selectedCategory===c"
                (click)="selectCategory(c)">{{ c }}</button>
      </div>
      <div *ngIf="loadingCats" class="spinner"></div>
      <div *ngIf="loadingMeals" class="spinner"></div>
      <div class="meals-grid" *ngIf="!loadingMeals && categoryMeals.length > 0">
        <ng-container *ngTemplateOutlet="mealCards; context:{meals:categoryMeals}"></ng-container>
      </div>
    </div>

    <!-- Bulk Import Tab -->
    <div *ngIf="activeTab==='bulk'" class="tab-content">
      <div class="card bulk-card">
        <h3>Bulk Import Meals</h3>
        <p class="bulk-desc">Paste multiple TheMealDB IDs (one per line or comma-separated) to import them all at once.</p>
        <div class="input-group" style="margin:20px 0">
          <label>Meal IDs</label>
          <textarea [(ngModel)]="bulkIds" rows="4" placeholder="52772&#10;52773&#10;52774"></textarea>
        </div>
        <div class="form-grid" style="margin-bottom:16px">
          <div class="input-group">
            <label>Default Price ($)</label>
            <input type="number" [(ngModel)]="bulkPrice" step="0.01" min="0" />
          </div>
          <div class="input-group">
            <label>Default Calories</label>
            <input type="number" [(ngModel)]="bulkCalories" step="1" min="0" />
          </div>
        </div>
        <label class="toggle-row" style="margin-bottom:20px">
          <input type="checkbox" [(ngModel)]="bulkAutoApprove" />
          <span style="font-size:14px">Auto-approve imported meals</span>
        </label>
        <button class="btn btn-primary" (click)="doBulkImport()" [disabled]="bulkLoading">
          {{ bulkLoading ? 'Importing...' : 'Import All' }}
        </button>
        <div class="alert alert-success" *ngIf="bulkResult" style="margin-top:16px">
          ✓ Imported: {{ bulkResult.importedCount }} |
          Skipped: {{ bulkResult.skipped.length }} |
          Failed: {{ bulkResult.failed.length }}
        </div>
        <div class="alert alert-error" *ngIf="bulkError">{{ bulkError }}</div>
      </div>
    </div>

    <!-- Meal card template -->
    <ng-template #mealCards let-meals="meals">
      <div class="meal-card" *ngFor="let m of meals">
        <div class="meal-thumb">
          <img [src]="m.strMealThumb || 'https://via.placeholder.com/200x140'"
               [alt]="m.strMeal" (error)="onImgError($event)" />
        </div>
        <div class="meal-body">
          <div class="meal-category">{{ m.strCategory }}</div>
          <h4 class="meal-name">{{ m.strMeal }}</h4>
          <div class="meal-area" *ngIf="m.strArea">{{ m.strArea }}</div>
          <div class="meal-id">ID: {{ m.idMeal }}</div>
        </div>
        <div class="meal-footer">
          <button class="btn btn-primary btn-sm" style="width:100%"
                  (click)="openImport(m)"
                  [disabled]="importingId === m.idMeal">
            {{ importingId === m.idMeal ? 'Importing...' : '↓ Import' }}
          </button>
        </div>
      </div>
    </ng-template>

    <!-- Import Modal -->
    <div class="modal-backdrop" *ngIf="importMeal" (click)="importMeal=null">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Import "{{ importMeal.strMeal }}"</h3>
          <button class="modal-close" (click)="importMeal=null">✕</button>
        </div>
        <div class="import-preview">
          <img [src]="importMeal.strMealThumb" [alt]="importMeal.strMeal" class="import-thumb" (error)="onImgError($event)" />
          <div>
            <div class="badge badge-amber">{{ importMeal.strCategory }}</div>
            <p style="font-size:13px;color:var(--text-muted);margin-top:6px">{{ importMeal.strArea }}</p>
          </div>
        </div>
        <div class="form-grid" style="margin-top:20px">
          <div class="input-group">
            <label>Price ($)</label>
            <input type="number" [(ngModel)]="importForm.estimatedPrice" step="0.01" />
          </div>
          <div class="input-group">
            <label>Calories</label>
            <input type="number" [(ngModel)]="importForm.calories" step="1" />
          </div>
          <div class="input-group span-2">
            <label>Brand</label>
            <input type="text" [(ngModel)]="importForm.brand" />
          </div>
        </div>
        <label class="toggle-row" style="margin:16px 0; display:flex; gap:8px; align-items:center; cursor:pointer; font-size:14px">
          <input type="checkbox" [(ngModel)]="importForm.approved" />
          <span>Approve immediately</span>
        </label>
        <div class="alert alert-error"   *ngIf="importError">{{ importError }}</div>
        <div class="alert alert-success" *ngIf="importSuccess">{{ importSuccess }}</div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="importMeal=null">Cancel</button>
          <button class="btn btn-primary" (click)="doImport()" [disabled]="importLoading">
            {{ importLoading ? 'Importing...' : 'Import Product' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
    .tab { background: none; border: none; color: var(--text-muted); padding: 10px 18px; font-size: 14px; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; transition: all .15s; }
    .tab:hover { color: var(--text); }
    .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
    .tab-content { animation: fadeIn .2s; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } }
    .search-row { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; }
    .search-wrap { position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
    .search-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px 10px 38px; color: var(--text); font-size: 14px; }
    .search-input:focus { outline: none; border-color: var(--accent); }
    .cat-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
    .cat-pill { padding: 7px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; font-size: 13px; color: var(--text-muted); cursor: pointer; transition: all .15s; }
    .cat-pill:hover, .cat-pill.active { background: rgba(245,166,35,.12); border-color: var(--accent); color: var(--accent); }
    .meals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; }
    .meal-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; transition: border-color .2s, transform .2s; }
    .meal-card:hover { border-color: rgba(245,166,35,.4); transform: translateY(-2px); }
    .meal-thumb { height: 140px; overflow: hidden; background: var(--surface2); }
    .meal-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
    .meal-card:hover .meal-thumb img { transform: scale(1.05); }
    .meal-body { padding: 12px 14px 8px; flex: 1; }
    .meal-category { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--accent); margin-bottom: 4px; }
    .meal-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; line-height: 1.3; }
    .meal-area { font-size: 12px; color: var(--text-muted); }
    .meal-id { font-size: 11px; color: var(--border); margin-top: 4px; font-family: monospace; }
    .meal-footer { padding: 10px 14px 14px; }
    .bulk-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .bulk-desc { color: var(--text-muted); font-size: 14px; }
    .toggle-row { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .import-preview { display: flex; gap: 16px; align-items: center; }
    .import-thumb { width: 80px; height: 60px; border-radius: 8px; object-fit: cover; }
  `]
})
export class AdminMealsComponent implements OnInit {
  activeTab: 'search' | 'category' | 'bulk' = 'search';
  meals: Meal[] = [];
  categoryMeals: Meal[] = [];
  categories: string[] = [];
  searchQuery = '';
  selectedCategory = '';
  loadingMeals = false;
  loadingCats = false;
  searched = false;

  // Import
  importMeal: Meal | null = null;
  importForm: ImportRequest = { estimatedPrice: 9.99, calories: 350, brand: 'Fawry Grocery', approved: false };
  importLoading = false;
  importingId = '';
  importError = '';
  importSuccess = '';

  // Bulk
  bulkIds = '';
  bulkPrice = 9.99;
  bulkCalories = 350;
  bulkAutoApprove = false;
  bulkLoading = false;
  bulkResult: any = null;
  bulkError = '';

  constructor(private mealSvc: MealService, private productSvc: ProductService) {}

  ngOnInit() {}

  searchMeals() {
    if (!this.searchQuery.trim()) return;
    this.loadingMeals = true; this.searched = true;
    this.mealSvc.search(this.searchQuery).subscribe({
      next: r => { this.meals = r || []; this.loadingMeals = false; },
      error: () => this.loadingMeals = false
    });
  }

  loadCategories() {
    if (this.categories.length) return;
    this.loadingCats = true;
    this.mealSvc.getCategories().subscribe({
      next: r => { this.categories = r; this.loadingCats = false; },
      error: () => this.loadingCats = false
    });
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat; this.loadingMeals = true;
    this.mealSvc.getByCategory(cat).subscribe({
      next: r => { this.categoryMeals = r || []; this.loadingMeals = false; },
      error: () => this.loadingMeals = false
    });
  }

  openImport(m: Meal) {
    this.importMeal = m;
    this.importForm = { estimatedPrice: 9.99, calories: 350, brand: 'Fawry Grocery', approved: false };
    this.importError = ''; this.importSuccess = '';
  }

  doImport() {
    if (!this.importMeal) return;
    this.importLoading = true; this.importingId = this.importMeal.idMeal;
    this.productSvc.importMeal(this.importMeal.idMeal, this.importForm).subscribe({
      next: p => {
        this.importSuccess = `✓ "${p.name}" imported successfully!`;
        this.importLoading = false; this.importingId = '';
        setTimeout(() => { this.importMeal = null; this.importSuccess = ''; }, 1800);
      },
      error: e => {
        this.importError = e.error?.message || 'Import failed';
        this.importLoading = false; this.importingId = '';
      }
    });
  }

  doBulkImport() {
    const ids = this.bulkIds.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!ids.length) return;
    this.bulkLoading = true; this.bulkError = ''; this.bulkResult = null;
    this.productSvc.bulkImport({ externalIds: ids, defaultPrice: this.bulkPrice, defaultCalories: this.bulkCalories, autoApprove: this.bulkAutoApprove }).subscribe({
      next: r => { this.bulkResult = r; this.bulkLoading = false; },
      error: e => { this.bulkError = e.error?.message || 'Bulk import failed'; this.bulkLoading = false; }
    });
  }

  onImgError(e: Event) { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x140?text=?'; }
}
