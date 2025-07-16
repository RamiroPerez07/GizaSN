import { Component, inject, OnInit } from '@angular/core';
import { IProduct } from '../../interfaces/products.interface';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PointOfSaleService } from '../../services/point-of-sale.service';
import { CustomerCheckoutFormComponent } from "../customer-checkout-form/customer-checkout-form.component";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CustomerCheckoutFormComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  productsInCart !: IProduct[];

  readonly cartSvc = inject(CartService);

  readonly routerSvc = inject(Router);

  readonly pointOfSaleSvc = inject(PointOfSaleService);

  subtotal!: number;

  showCustomerCheckoutModal! : boolean;

  ngOnInit(): void {
    this.cartSvc.$productsInCart.subscribe({
      next: (productsInCart: IProduct[]) => {
        this.productsInCart = productsInCart
        if(productsInCart.length <= 0){
          this.routerSvc.navigate(['products'])
          return
        }
        this.subtotal = this.cartSvc.getSubtotal();
      }
    })

    this.cartSvc.$showCustomerCheckoutModal.subscribe({
      next: (showCustomerCheckoutModal: boolean) => {
        this.showCustomerCheckoutModal = showCustomerCheckoutModal;
      }
    })

  }

  addProductToCart(product: IProduct){
    this.cartSvc.addProductToCart(product);
  }

  decreaseProductFromCart(product: IProduct){
    this.cartSvc.decreaseProductFromCart(product);
  }

  removeItemFromCart(product: IProduct){
    this.cartSvc.removeItemFromCart(product);
  }

  cleanCart(){
    this.productsInCart.forEach((product) => this.cartSvc.removeItemFromCart(product) )
    this.routerSvc.navigate(['products'])
  }

  openForm(){
    this.cartSvc.openCustomerCheckoutModal();   //abrimos el modal
  }

  viewProductDetail(id: number){
    this.routerSvc.navigate(["products", id]);
  }

}
