import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { IOrder } from '../../interfaces/orders.interface';
import { OrdersService } from '../../services/orders.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.css'
})
export class OrderCardComponent implements OnInit {
  @Input() order! : IOrder;

  orderSvc = inject(OrdersService);

  subtotal! : number;

  loading = false;

  ngOnInit(): void {
    this.subtotal = this.orderSvc.calculateOrderSubtotal(this.order ?? []);
  }

  statusClasses: Record<string, string> = {
    'Pendiente': 'status-pending',
    'Pendiente de cobro': 'status-delivered',
    'Pendiente de entrega': 'status-charged',
    'Entregado y cobrado': 'status-completed',
    'Anulado' : 'status-cancelled'
  };

  onDeliveredChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.loading = true;
    this.orderSvc.updateOrderStatusFlags(this.order, { delivered: checked })
      .subscribe({
        next: updated => { 
          this.order = updated; 
          this.loading = false; 
        },
        error: () => { 
          this.loading = false; 
        }
      });
  }

  onChargedChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.loading = true;
    this.orderSvc.updateOrderStatusFlags(this.order, { charged: checked })
      .subscribe({
        next: updated => { 
          this.order = updated; 
          this.loading = false; 
        },
        error: () => { 
          this.loading = false; 
        }
      });
  }

  router = inject(Router);

  viewOrderDetail(order: IOrder){
    this.router.navigate(['orders', order._id]);
  }
}
