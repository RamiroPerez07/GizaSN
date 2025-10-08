import { CurrencyPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { IOrder } from '../../interfaces/orders.interface';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.css'
})
export class OrderCardComponent implements OnInit {
  @Input() order! : IOrder;

  orderSvc = inject(OrdersService);

  subtotal! : number;

  ngOnInit(): void {
    this.subtotal = this.orderSvc.calculateOrderSubtotal(this.order ?? []);
  }
}
