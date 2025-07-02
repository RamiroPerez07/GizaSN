import { Component, inject, OnInit } from '@angular/core';
import { IProduct } from '../../interfaces/products.interface';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PointOfSaleService } from '../../services/point-of-sale.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  productsInCart !: IProduct[];

  readonly cartSvc = inject(CartService);

  readonly routerSvc = inject(Router);

  subtotal!: number;

  ngOnInit(): void {
    this.cartSvc.$productsInCart.subscribe({
      next: (productsInCart: IProduct[]) => {
        this.productsInCart = productsInCart
        if(productsInCart.length <= 0){
          this.routerSvc.navigate(['products'])
          return
        }
        this.subtotal = this.productsInCart.reduce((acc: number, p: IProduct) => acc + (p.price * (p.quantity ?? 0) * (1 - (p.discount1 ?? 0) / 100) * (1 - (p.discount2 ?? 0) / 100) * (1 - (p.discount3 ?? 0) / 100)), 0);
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

  readonly pointOfSaleSvc = inject(PointOfSaleService);

  sendWhatsapp(){

    const pos = this.pointOfSaleSvc.getCurrentPointOfSale();

    if (!pos) {
      console.warn('No se encontró un punto de venta válido');
      return;
    }

    console.log(pos)

    const telefono = pos.telefono;

    let mensaje = `Hola! 👋\n\n`;
    mensaje += `Te hago el siguiente pedido:\n\n`;

    this.productsInCart.forEach((product, index) => {

      mensaje += `${index + 1}. ${product.description}\n`;
      mensaje += `Marca: ${product.brand}\n`;
      mensaje += `Cantidad: ${product.quantity}\n`;
      mensaje += `Precio Unitario: $${product.price}\n\n`;
    });

    mensaje += `🧾 Total $${this.subtotal}\n\n`;

    mensaje += `Gracias!\nSaludos.`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
    window.open(url, '_blank');
  }

  viewProductDetail(id: number){
    this.routerSvc.navigate(["products", id]);
  }

}
