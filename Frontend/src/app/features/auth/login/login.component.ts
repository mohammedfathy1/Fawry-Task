import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">🛒</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your Fawry Grocery account</p>
        </div>

        <div class="alert alert-error" *ngIf="error">{{ error }}</div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-fields">
            <div class="input-group">
              <label>Username</label>
              <input type="text" [(ngModel)]="username" name="username"
                     placeholder="Enter username" required autocomplete="username" />
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="password" name="password"
                     placeholder="Enter password" required autocomplete="current-password" />
            </div>
          </div>

          <button class="btn btn-primary submit-btn" type="submit" [disabled]="loading">
            <span *ngIf="loading" class="btn-spinner"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/auth/register">Register</a>
        </div>

        <div class="demo-accounts">
          <p class="demo-label">Quick fill:</p>
          <div class="demo-btns">
            <button class="demo-btn" type="button" (click)="fillAdmin()">Admin</button>
            <button class="demo-btn" type="button" (click)="fillUser()">Test User</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 60px);
      display: flex; align-items: center; justify-content: center;
      padding: 40px 16px;
      margin: -32px -24px;
      background: radial-gradient(ellipse at 50% 0%, rgba(245,166,35,.08) 0%, transparent 60%);
    }
    .auth-card {
      width: 100%; max-width: 420px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 40px;
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 44px; margin-bottom: 12px; }
    .auth-header h1 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
    .auth-header p  { color: var(--text-muted); font-size: 14px; }
    .form-fields { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
    .submit-btn {
      width: 100%; justify-content: center;
      padding: 12px; font-size: 15px; font-weight: 600;
    }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(0,0,0,.3);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer {
      text-align: center; margin-top: 20px;
      font-size: 14px; color: var(--text-muted);
    }
    .demo-accounts {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .demo-label { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; text-align: center; }
    .demo-btns { display: flex; gap: 8px; justify-content: center; }
    .demo-btn {
      padding: 6px 20px; border-radius: 6px; font-size: 13px;
      background: var(--surface2); border: 1px solid var(--border);
      color: var(--text-muted); cursor: pointer; transition: all 0.15s;
    }
    .demo-btn:hover { border-color: var(--accent); color: var(--accent); }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading  = false;
  error    = '';

  constructor(private auth: AuthService, private router: Router) {}

  fillAdmin() { this.username = 'admin';    this.password = 'admin123'; }
  fillUser()  { this.username = 'testuser'; this.password = 'password123'; }

  onSubmit() {
    if (!this.username || !this.password) return;
    this.loading = true; this.error = '';
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: (r) => this.router.navigate([r.role === 'ROLE_ADMIN' ? '/admin' : '/products']),
      error: (e) => { this.error = e.error?.message || 'Invalid credentials'; this.loading = false; }
    });
  }
}
