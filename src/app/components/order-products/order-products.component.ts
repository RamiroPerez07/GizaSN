import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-order-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-products.component.html',
  styleUrl: './order-products.component.css'
})
export class OrderProductsComponent {

}
