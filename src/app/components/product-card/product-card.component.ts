import { Component, inject, Input } from '@angular/core';
import { IProduct } from '../../interfaces/products.interface';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart.service';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product!: IProduct;

  @Input() categoryId!: string | null;

  @Input() smallCard: boolean = false;

  @Input() onCardClick: Function = () => {
    this.viewProductDetail(this.product, this.categoryId);
  };

  roundTo100 = (value: number) => Math.ceil(value / 100) * 100;

  readonly routerSvc = inject(Router);
  
  readonly cartSvc = inject(CartService);
  
  readonly toastSvc = inject(ToastrService);

  addProduct(product: IProduct){
    this.cartSvc.addProductToCart(product);
    this.toastSvc.success(`${product.description} - ${product.brand}`, "Producto agregado al carrito");
  }

  viewProductDetail(product: IProduct, categoryId: string | null = null) {
    if (categoryId) {
      this.routerSvc.navigate(["products", "category", categoryId, "product", product.id]);
    } else {
      // fallback si no hay categoría en la URL
      this.routerSvc.navigate(["products", product.id]);
    }
  }

}
