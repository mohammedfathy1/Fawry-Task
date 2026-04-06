import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a class="brand" routerLink="/">
          <span class="brand-icon">🛒</span>
          <span class="brand-name">Fawry<span class="brand-accent">Grocery</span></span>
        </a>

        <div class="nav-links" *ngIf="isLoggedIn">
          <a routerLink="/products" routerLinkActive="active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
            Products
          </a>
          <a routerLink="/shopping-list" routerLinkActive="active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Shopping List
          </a>
          <ng-container *ngIf="isAdmin">
            <span class="divider"></span>
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Dashboard
            </a>
            <a routerLink="/admin/products" routerLinkActive="active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              Manage
            </a>
            <a routerLink="/admin/meals" routerLinkActive="active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Meals DB
            </a>
          </ng-container>
        </div>

        <div class="nav-right">
          <ng-container *ngIf="isLoggedIn; else guestLinks">
            <div class="user-pill">
              <span class="user-avatar">{{ username.charAt(0).toUpperCase() }}</span>
              <span class="user-name">{{ username }}</span>
              <span class="user-role" [class.admin-role]="isAdmin">{{ isAdmin ? 'Admin' : 'User' }}</span>
            </div>
            <button class="btn btn-ghost btn-sm" (click)="logout()">Logout</button>
          </ng-container>
          <ng-template #guestLinks>
            <a class="btn btn-ghost btn-sm" routerLink="/auth/login">Login</a>
            <a class="btn btn-primary btn-sm" routerLink="/auth/register">Register</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 100;
      backdrop-filter: blur(12px);
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 60px;
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-icon { font-size: 22px; }
    .brand-name {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 18px;
      color: var(--text);
    }
    .brand-accent { color: var(--accent); }
    .nav-links {
      display: flex; align-items: center; gap: 4px;
      flex: 1;
    }
    .nav-links a {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 12px;
      border-radius: 7px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.15s;
    }
    .nav-links a:hover { background: var(--surface2); color: var(--text); }
    .nav-links a.active { background: rgba(245,166,35,.12); color: var(--accent); }
    .divider { width: 1px; height: 20px; background: var(--border); margin: 0 8px; }
    .nav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .user-pill {
      display: flex; align-items: center; gap: 8px;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 5px 12px 5px 5px;
    }
    .user-avatar {
      width: 26px; height: 26px;
      background: var(--accent);
      color: #000;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
    }
    .user-name { font-size: 13px; font-weight: 500; }
    .user-role {
      font-size: 11px; font-weight: 600;
      background: rgba(122,122,154,.2);
      color: var(--text-muted);
      padding: 2px 7px; border-radius: 10px;
    }
    .admin-role { background: rgba(245,166,35,.15); color: var(--accent); }
  `]
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin    = false;
  username   = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.loggedIn$.subscribe(() => {
      this.isLoggedIn = this.auth.hasToken();
      this.isAdmin    = this.auth.isAdmin();
      this.username   = this.auth.getUsername();
    });
  }

  logout() { this.auth.logout(); }
}
