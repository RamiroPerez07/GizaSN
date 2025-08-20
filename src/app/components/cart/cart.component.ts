import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PointOfSaleService } from '../../services/point-of-sale.service';
import { CustomerCheckoutFormComponent } from "../customer-checkout-form/customer-checkout-form.component";
import { tap } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CustomerCheckoutFormComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  readonly cartSvc = inject(CartService);
  readonly routerSvc = inject(Router);
  readonly pointOfSaleSvc = inject(PointOfSaleService);

  // Observables directamente del servicio
  readonly productsInCart$ = this.cartSvc.productsInCart$.pipe(
    tap(products => {
      if (products.length === 0) {
        this.routerSvc.navigate(['products']);
      }
    })
  );

  roundTo100 = (value: number) => Math.ceil(value / 100) * 100;

  readonly subtotal$ = this.cartSvc.subtotal$;
  readonly showCustomerCheckoutModal$ = this.cartSvc.showCustomerCheckoutModal$;

  addProductToCart(product: any) {
    this.cartSvc.addProductToCart(product);
  }

  decreaseProductFromCart(product: any) {
    this.cartSvc.decreaseProductFromCart(product);
  }

  removeItemFromCart(product: any) {
    this.cartSvc.removeItemFromCart(product);
  }

  cleanCart(products: any[]) {
    products.forEach(p => this.cartSvc.removeItemFromCart(p));
    this.routerSvc.navigate(['products']);
  }

  openForm() {
    this.cartSvc.openCustomerCheckoutModal();
  }

  viewProductDetail(id: number) {
    this.routerSvc.navigate(["products", id]);
  }

}
