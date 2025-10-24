import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IProduct } from '../../interfaces/products.interface';
import { OrdersService } from '../../services/orders.service';
import { products } from '../../data/products';

@Component({
  selector: 'app-order-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-products.component.html',
  styleUrl: './order-products.component.css'
})
export class OrderProductsComponent {

  @Output() listShown = new EventEmitter<void>();

  private readonly productsSvc = inject(ProductsService);
  private readonly productsSignal = signal<IProduct[]>([]);
  private readonly ordersSvc = inject(OrdersService);
  private readonly productsInOrderSignal = signal<IProduct[]>([]);

  productsInOrder$ = this.ordersSvc.productsInOrder$;

  // campo de búsqueda
  query = signal('');

  // resultados filtrados (computed)
  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    return this.productsSignal().filter(p =>
      p.description.toLowerCase().includes(q) ||
      p.longDescription.toLowerCase().includes(q)
    ).slice(0, 10); // limitar resultados
  });

  totalQuantity = computed(() => {
    return this.productsInOrderSignal().reduce((prev, product) => {
      return prev + (product.quantity || 0) 
    }, 0)
  })

  subtotal = computed(() => {
    return this.productsInOrderSignal().reduce((prev, product) => {
      const quantity = product.quantity || 0;
      const price = product.price || 0;
      return prev + quantity * price;
    }, 0);
  });

  // visibilidad del dropdown
  showList = signal(false);

  constructor() {
    this.productsSvc.products$.subscribe(products => {
      this.productsSignal.set(products);
    });
    this.ordersSvc.productsInOrder$.subscribe(products => {
      this.productsInOrderSignal.set(products)
    })
  }

  onInputChange(value: string) {
    this.query.set(value);
    this.showList.set(!!value);
    // Emití cuando hay productos
    if (this.showList()) {
      this.listShown.emit();
    }
  }

  selectProduct(product: IProduct) {
    //this.query.set(product.description);
    this.query.set("");
    this.showList.set(false);
    this.ordersSvc.addProductToOrder(product);
  }

  clear() {
    this.query.set('');
    this.showList.set(false);
  }

  desappear(){
    setTimeout(() => this.showList.set(false), 200)
  }

  removeItemFromOrder(product: IProduct){
    this.ordersSvc.removeItemFromOrder(product);
  }

  updateProduct(product: IProduct, field: 'quantity' | 'price', value: number) {
    this.ordersSvc.updateProduct(product, field, value);
  }
}
