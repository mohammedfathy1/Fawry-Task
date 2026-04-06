import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">🛒</div>
          <h1>Create Account</h1>
          <p>Join Fawry Grocery today</p>
        </div>

        <div class="alert alert-error"   *ngIf="error">{{ error }}</div>
        <div class="alert alert-success" *ngIf="success">{{ success }}</div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-fields">
            <div class="input-group">
              <label>Username</label>
              <input type="text" [(ngModel)]="username" name="username"
                     placeholder="Choose a username" required />
            </div>
            <div class="input-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="email" name="email"
                     placeholder="your@email.com" required />
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="password" name="password"
                     placeholder="Min 6 characters" required />
            </div>
            <div class="role-toggle">
              <label class="toggle-label">
                <input type="checkbox" [(ngModel)]="isAdmin" name="isAdmin" />
                <span class="toggle-track"></span>
                Register as Admin
              </label>
            </div>
          </div>

          <button class="btn btn-primary submit-btn" type="submit" [disabled]="loading">
            <span *ngIf="loading" class="btn-spinner"></span>
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/auth/login">Sign in</a>
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
      background: radial-gradient(ellipse at 50% 0%, rgba(232,67,147,.06) 0%, transparent 60%);
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
    .submit-btn { width: 100%; justify-content: center; padding: 12px; font-size: 15px; font-weight: 600; }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(0,0,0,.3);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-muted); }
    .role-toggle { display: flex; align-items: center; }
    .toggle-label {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; font-size: 14px; color: var(--text-muted);
      user-select: none;
    }
    .toggle-label input[type="checkbox"] { display: none; }
    .toggle-track {
      width: 36px; height: 20px;
      background: var(--border);
      border-radius: 10px;
      position: relative;
      transition: background 0.2s;
    }
    .toggle-track::after {
      content: '';
      position: absolute;
      width: 14px; height: 14px;
      background: #fff;
      border-radius: 50%;
      top: 3px; left: 3px;
      transition: left 0.2s;
    }
    input:checked + .toggle-track { background: var(--accent); }
    input:checked + .toggle-track::after { left: 19px; }
  `]
})
export class RegisterComponent {
  username = '';
  email    = '';
  password = '';
  isAdmin  = false;
  loading  = false;
  error    = '';
  success  = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.email || !this.password) return;
    this.loading = true; this.error = ''; this.success = '';
    this.auth.register({ username: this.username, email: this.email, password: this.password }, this.isAdmin)
      .subscribe({
        next: (r) => this.router.navigate([r.role === 'ROLE_ADMIN' ? '/admin' : '/products']),
        error: (e) => { this.error = e.error?.message || 'Registration failed'; this.loading = false; }
      });
  }
}
