import { Component, inject } from '@angular/core';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { of, switchMap, take } from 'rxjs';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private router = inject(Router);

  //isLoading: boolean = false;

  private authService = inject(AuthService);

  private toastSvc = inject(ToastrService);

  private loadingSvc = inject(LoadingService);

  loading$ = this.loadingSvc.loading$;
  
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
    
    this.loadingSvc.show();

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
      .subscribe({
        next: (isValid) => {
          if (isValid) {
            this.router.navigate(['/orders']);
          }
        },
        error: (err) => {
          this.toastSvc.error("Error en la validación del token");
        },
        complete: () => {
          this.loadingSvc.hide();
        }
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loadingSvc.show();

    const { username, password } = this.form.value;

    this.authService.login(username!, password!).subscribe({
      next: (user) => {
        this.loadingSvc.hide();
        this.loginError = null;

        if (user) {
          this.router.navigate(['orders']);
        } else {
          // Este caso depende de si el backend responde con null o error, lo dejamos por si acaso
          this.setLoginError('Credenciales incorrectas');
        }
      },
      error: (err) => {
        this.loadingSvc.hide();
        console.error('Login error:', err);
        this.setLoginError('Usuario o contraseña incorrectos');
      }
    });
  }
}
