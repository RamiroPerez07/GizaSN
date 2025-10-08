import { Component, inject, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { CommonModule, NgClass } from '@angular/common';
import { OrderCardComponent } from "../order-card/order-card.component";
import { OrdersService } from '../../services/orders.service';
import { OrderFormComponent } from "../order-form/order-form.component";

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [BreadcrumbComponent, NgClass, OrderCardComponent, OrderFormComponent, CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {

  private readonly router = inject(Router);
  private readonly orderSvc = inject(OrdersService);

  breadcrumbRoutes = [
    { name: 'Inicio', redirectFx: () => this.router.navigate(['']) },
    { name: 'Pedidos', redirectFx: () => this.router.navigate(['orders']) }
  ]

  filter$ = this.orderSvc.$filterSubject;

  orders$ = this.orderSvc.orders$;

  setFilter(status: string){
    this.orderSvc.setFilter(status);
  }

  openNewOrderDialog(){
    this.orderSvc.openCreateOrderModal();
  }
}
