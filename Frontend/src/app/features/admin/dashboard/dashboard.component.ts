import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="welcome-banner">
        <div class="welcome-text">
          <h2>Welcome back, {{ username }} 👋</h2>
          <p>You're logged in as <span class="role-tag">Admin</span>. Manage products, import meals, and control the grocery catalog.</p>
        </div>
        <div class="welcome-art">🛒</div>
      </div>

      <div class="action-grid">
        <a class="action-card" routerLink="/admin/products">
          <div class="action-icon" style="background:rgba(245,166,35,.12);color:var(--accent)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div class="action-text">
            <h3>Manage Products</h3>
            <p>View, edit, approve or delete grocery products</p>
          </div>
          <div class="action-arrow">→</div>
        </a>

        <a class="action-card" routerLink="/admin/meals">
          <div class="action-icon" style="background:rgba(232,67,147,.12);color:var(--accent2)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div class="action-text">
            <h3>Browse Meals DB</h3>
            <p>Search TheMealDB and import meals as products</p>
          </div>
          <div class="action-arrow">→</div>
        </a>

        <a class="action-card" routerLink="/products">
          <div class="action-icon" style="background:rgba(46,204,113,.12);color:var(--green)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
          </div>
          <div class="action-text">
            <h3>View as User</h3>
            <p>See the public grocery catalog your users see</p>
          </div>
          <div class="action-arrow">→</div>
        </a>

        <a class="action-card" routerLink="/shopping-list">
          <div class="action-icon" style="background:rgba(52,152,219,.12);color:#3498db">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </div>
          <div class="action-text">
            <h3>Shopping List</h3>
            <p>View your personal cart and order summary</p>
          </div>
          <div class="action-arrow">→</div>
        </a>
      </div>

      <div class="tip-box">
        <div class="tip-icon">💡</div>
        <div>
          <strong>Quick Tip:</strong> Go to <strong>Meals DB</strong> to search TheMealDB, then click
          <em>Import</em> on any meal to add it to your product catalog. After importing,
          head to <strong>Manage Products</strong> to set the price and approve it.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-banner {
      background: linear-gradient(135deg, var(--surface) 0%, rgba(245,166,35,.06) 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 32px;
    }
    .welcome-text h2 { font-size: 26px; font-weight: 800; margin-bottom: 8px; }
    .welcome-text p  { color: var(--text-muted); font-size: 14px; max-width: 500px; }
    .role-tag {
      background: rgba(245,166,35,.15); color: var(--accent);
      padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: 600;
    }
    .welcome-art { font-size: 64px; opacity: .6; }
    .action-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
      margin-bottom: 28px;
    }
    @media (max-width: 600px) { .action-grid { grid-template-columns: 1fr; } }
    .action-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 24px;
      display: flex; align-items: center; gap: 18px;
      text-decoration: none; color: var(--text);
      transition: all .2s;
    }
    .action-card:hover { border-color: rgba(245,166,35,.4); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,.2); }
    .action-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .action-text { flex: 1; }
    .action-text h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .action-text p  { font-size: 13px; color: var(--text-muted); }
    .action-arrow { font-size: 20px; color: var(--text-muted); transition: transform .2s; }
    .action-card:hover .action-arrow { transform: translateX(4px); color: var(--accent); }
    .tip-box {
      background: rgba(245,166,35,.06); border: 1px solid rgba(245,166,35,.2);
      border-radius: 12px; padding: 16px 20px;
      display: flex; gap: 12px; align-items: flex-start;
      font-size: 14px; color: var(--text-muted); line-height: 1.6;
    }
    .tip-box strong, .tip-box em { color: var(--text); }
    .tip-icon { font-size: 20px; flex-shrink: 0; }
  `]
})
export class DashboardComponent {
  username: string;
  constructor(auth: AuthService) { this.username = auth.getUsername(); }
}
