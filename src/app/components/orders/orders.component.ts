import { Component, inject, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { CommonModule, NgClass } from '@angular/common';
import { OrderCardComponent } from "../order-card/order-card.component";
import { OrdersService } from '../../services/orders.service';
import { OrderFormComponent } from "../order-form/order-form.component";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [BreadcrumbComponent, NgClass, OrderCardComponent, OrderFormComponent, CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly orderSvc = inject(OrdersService);
  private readonly authSvc = inject(AuthService);

  user$ = this.authSvc.user$;

  breadcrumbRoutes = [
    { name: 'Inicio', redirectFx: () => this.router.navigate(['']) },
    { name: 'Pedidos', redirectFx: () => this.router.navigate(['orders']) }
  ]

  currentPage = 1;

  nextPage() {
    this.currentPage++;
    this.orderSvc.setPage(this.currentPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.orderSvc.setPage(this.currentPage);
    }
  }

  ngOnInit(): void {
    this.orderSvc.refreshOrders();
  }

  filter$ = this.orderSvc.filter$;

  // orders$ = this.orderSvc.orders$;

  paginatedOrders$ = this.orderSvc.paginatedOrders$;

  setFilter(status: string){
    this.currentPage = 1;
    this.orderSvc.setPage(this.currentPage);
    this.orderSvc.setFilter(status);
  }

  openNewOrderDialog(){
    this.orderSvc.openCreateOrderModal();
  }

  logout(){
    this.authSvc.logout();
    this.router.navigate(['login']);
  }
}
