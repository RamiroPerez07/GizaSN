import { Component, inject } from '@angular/core';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
}
