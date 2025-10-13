import { Component, inject } from '@angular/core';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { of, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private router = inject(Router);

  isLoading: boolean = false;

  private authService = inject(AuthService);
  
  breadcrumbRoutes : {name: string, redirectFx: Function}[] = [
    {
      name: "Inicio",
      redirectFx: () => {this.router.navigate([""])}
    },
    {
      name: "Ingresar",
      redirectFx: () => {},
    }
  ]

  readonly fb = inject(FormBuilder);

  loginError: string | null = null;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  private setLoginError(message: string) {
      this.loginError = message;
  }

  ngOnInit(): void {
    this.authService.user$
      .pipe(
        take(1),
        switchMap(user => {
          if (user?.token) {
            return this.authService.validateToken();
          }
          return of(false);
        })
      )
      .subscribe(isValid => {
        if (isValid) {
          this.router.navigate(['/orders']);
        }
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const { username, password } = this.form.value;

    this.authService.login(username!, password!).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.loginError = null;

        if (user) {
          this.router.navigate(['orders']);
        } else {
          // Este caso depende de si el backend responde con null o error, lo dejamos por si acaso
          this.setLoginError('Credenciales incorrectas');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        this.setLoginError('Usuario o contraseña incorrectos');
      }
    });
  }
}
