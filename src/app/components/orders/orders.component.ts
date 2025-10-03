import { Component, inject } from '@angular/core';
import { Router } from "@angular/router";
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { NgClass } from '@angular/common';
import { OrderCardComponent } from "../order-card/order-card.component";

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [BreadcrumbComponent, NgClass, OrderCardComponent],
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

  orders = [
    {
      id: "dasdsadas",
      pos: "Giza",
      comprador: "Mariano Aguirre",
      direccion: "Av. Savio 1500",
      localidad: "San Nicolás de los Arroyos",
      formaPago: "Efectivo",
      documento: null,
      monto: 19000,
    },
    {
      id: "asddsa",
      pos: "Giza",
      comprador: "Gustavo Ferreyra",
      direccion: "Av. Falcón 800",
      localidad: "San Nicolás de los Arroyos",
      formaPago: "Transferencia",
      documento: "40486596",
      monto: 23000,
    }
  ]
}
