import { Component, inject, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, startWith, Subject, switchMap, tap } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { IOrder } from '../../interfaces/orders.interface';
import { ToastrService } from 'ngx-toastr';
import { OrderFormComponent } from "../order-form/order-form.component";

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent, OrderFormComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent {

  private orderSvc = inject(OrdersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastSvc = inject(ToastrService);

  editOrder(){
    this.orderSvc.openCreateOrderModal();
  }

  reloadOrder() {
    this.reload$.next();
  }

  private reload$ = new Subject<void>();

  observation: string = '';
  saving = false;

  order!: IOrder & { subtotal: number; breadcrumbRoutes: { name: string; redirectFx: () => void }[] };
  
  readonly vm$ = this.reload$.pipe(
    startWith(undefined), // carga inicial
    switchMap(() => this.route.paramMap.pipe(
      switchMap(params => this.orderSvc.getOrderById(params.get('id')!)),
      map(order => ({
        ...order,
        subtotal: this.orderSvc.calculateOrderSubtotal(order),
        breadcrumbRoutes: [
          { name: 'Inicio', redirectFx: () => this.router.navigate(['']) },
          { name: 'Pedidos', redirectFx: () => this.router.navigate(['orders']) },
          { name: 'Pedido #' + order.idOrder, redirectFx: () => {} }
        ]
      })),
      tap(order => {
        this.order = order;
        this.observation = order.observation ?? '';
      })
    ))
  );

  saveObservations(orderId: string | undefined) {
    if (!orderId) return;
    this.saving = true;
    this.orderSvc.updateOrderObservations(orderId, this.observation).subscribe({
      next: () => this.saving = false,
      error: () => this.saving = false
    });
  }

  canceling = false;

  cancelOrder(orderId: string | undefined) {
    if (!orderId) return;
    const confirmCancel = confirm('¿Seguro que querés anular este pedido?');
    if (!confirmCancel) return;

    this.canceling = true;
    this.orderSvc.cancelOrder(orderId).subscribe({
      next: () => {
        this.canceling = false;
        this.toastSvc.success('Pedido anulado correctamente')
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.canceling = false;
        alert('Error al anular el pedido');
      }
    });
  }

  isLoading = false;

  onDeliveredChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isLoading = true;
    this.orderSvc.updateOrderStatusFlags(this.order, { delivered: checked })
      .subscribe({
        next: updated => { 
          this.order = { ...this.order, ...updated }; 
          this.isLoading = false; 
        },
        error: () => { this.isLoading = false; }
      });
  }

  onChargedChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isLoading = true;
    this.orderSvc.updateOrderStatusFlags(this.order, { charged: checked })
      .subscribe({
        next: updated => { 
          this.order = { ...this.order, ...updated }; 
          this.isLoading = false; 
        },
        error: () => { this.isLoading = false; }
      });
  }
}
