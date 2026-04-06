import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthRequest, AuthResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'fg_token';
  private readonly USER_KEY  = 'fg_user';
  private readonly ROLE_KEY  = 'fg_role';

  private _loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this._loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(body: AuthRequest, isAdmin = false): Observable<AuthResponse> {
    const url = isAdmin
      ? `${environment.apiUrl}/auth/register/admin`
      : `${environment.apiUrl}/auth/register`;
    return this.http.post<AuthResponse>(url, body).pipe(tap(r => this.save(r)));
  }

  login(body: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, body)
      .pipe(tap(r => this.save(r)));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this._loggedIn.next(false);
    this.router.navigate(['/auth/login']);
  }

  getToken()    { return localStorage.getItem(this.TOKEN_KEY); }
  getUsername() { return localStorage.getItem(this.USER_KEY) || ''; }
  getRole()     { return localStorage.getItem(this.ROLE_KEY) || ''; }
  isAdmin()     { return this.getRole() === 'ROLE_ADMIN'; }
  hasToken()    { return !!localStorage.getItem(this.TOKEN_KEY); }

  private save(r: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, r.token);
    localStorage.setItem(this.USER_KEY,  r.username);
    localStorage.setItem(this.ROLE_KEY,  r.role);
    this._loggedIn.next(true);
  }
}
