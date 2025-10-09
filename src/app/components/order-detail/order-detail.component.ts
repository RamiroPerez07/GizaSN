import { Component, inject, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent {

  private orderSvc = inject(OrdersService);
  private route = inject(ActivatedRoute);

  observation = '';
  saving = false;

  readonly vm$ = this.route.paramMap.pipe(
    switchMap(params => this.orderSvc.getOrderById(params.get('id')!)),
    map(order => ({
      ...order,
      subtotal: this.orderSvc.calculateOrderSubtotal(order)
    })),
    tap(order => this.observation = order.observation ?? '')
  );

  saveObservations(orderId: string | undefined) {
    if (!orderId) return;
    this.saving = true;
    this.orderSvc.updateOrderObservations(orderId, this.observation).subscribe({
      next: () => this.saving = false,
      error: () => this.saving = false
    });
  }
}
