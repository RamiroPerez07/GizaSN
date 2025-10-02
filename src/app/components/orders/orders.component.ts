import { Component, inject } from '@angular/core';
import { Router, ɵEmptyOutletComponent } from "@angular/router";
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {

  private readonly router = inject(Router);

  breadcrumbRoutes = [
    { name: 'Inicio', redirectFx: () => this.router.navigate(['']) },
    { name: 'Pedidos', redirectFx: () => this.router.navigate(['orders']) }
  ]

  filter! : string;

  setFilter(status: string){
    this.filter = status;
  }
}
