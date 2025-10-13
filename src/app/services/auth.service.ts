import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { IUser } from '../interfaces/user.interface';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _platformId = inject(PLATFORM_ID);

  private readonly _localStorageKey = 'giza-user';

  private _user = new BehaviorSubject<IUser | null>(null);
  public readonly user$ = this._user.asObservable();

  constructor() {
    if (this._isBrowser()) {
      const storedUser = this._getStoredUser();

      if (storedUser) {
        this._user.next(storedUser);

        // Validar token con backend y hacer logout si es inválido
        this.validateToken().subscribe((isValid) => {
          if (!isValid) {
            console.log('Token inválido. Cerrando sesión.');
            this.logout();
          }
        });
      }
    }
  }

  /**
   * Login y persistencia del usuario
   */
  login(username: string, password: string): Observable<IUser | null> {
    return this._http
      .post<IUser | null>('https://giza-sn-backend.vercel.app/api/auth/login', {
        username,
        password,
      })
      .pipe(
        tap((user) => {
          if (user) {
            this._user.next(user);
            this._saveUser(user);
          } else {
            // En caso raro que no venga usuario, aseguramos logout
            this.logout();
          }
        }),
        catchError((err) => {
          console.error('Error en login:', err);
          this.logout();
          return of(null);
        })
      );
  }

  /**
   * Logout y limpieza del usuario
   */
  logout(): void {
    this._user.next(null);
    this._clearStoredUser();
    console.log('Sesión cerrada');
  }

  /**
   * Devuelve el usuario actual
   */
  getCurrentUser(): IUser | null {
    return this._user.getValue();
  }

  /**
   * Devuelve el token actual
   */
  getToken(): string | null {
    return this.getCurrentUser()?.token || null;
  }

  /**
   * Verifica si está en navegador
   */
  private _isBrowser(): boolean {
    return isPlatformBrowser(this._platformId);
  }

  /**
   * Guarda usuario en localStorage
   */
  private _saveUser(user: IUser): void {
    if (this._isBrowser()) {
      localStorage.setItem(this._localStorageKey, JSON.stringify(user));
    }
  }

  /**
   * Elimina usuario de localStorage
   */
  private _clearStoredUser(): void {
    if (this._isBrowser()) {
      localStorage.removeItem(this._localStorageKey);
    }
  }

  /**
   * Obtiene usuario desde localStorage
   */
  private _getStoredUser(): IUser | null {
    if (!this._isBrowser()) return null;

    const raw = localStorage.getItem(this._localStorageKey);
    if (!raw) return null;

    try {
      const user = JSON.parse(raw) as IUser;
      if (user?.token && user?.username) {
        return user;
      }
    } catch (err) {
      console.error('Error al parsear giza-user desde localStorage', err);
    }

    return null;
  }

  /**
   * Valida el token actual con el backend.
   * Retorna true si el token es válido, false si no.
   * Hace logout si token inválido o error.
   */
  validateToken(): Observable<boolean> {
    const token = this.getToken();

    if (!token) {
      this.logout();
      return of(false);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this._http
      .get<{ message: string; user: IUser }>(
        'https://giza-sn-backend.vercel.app/api/auth/validate',
        { headers }
      )
      .pipe(
        map((response) => {
          if (response?.message === 'Token válido') {
            return true;
          } else {
            console.warn('Respuesta inesperada en validateToken:', response);
            this.logout();
            return false;
          }
        }),
        catchError((err) => {
          console.warn('Token inválido o expirado:', err);
          this.logout();
          return of(false);
        })
      );
  }
}