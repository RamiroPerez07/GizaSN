import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-carousel.component.html',
  styleUrl: './card-carousel.component.css'
})
export class CardCarouselComponent {

  paused = false;

  products! :IProduct[];

  readonly productsSvc = inject(ProductsService);
  readonly cartSvc = inject(CartService);
  readonly toastSvc = inject(ToastrService);
  readonly routerSvc = inject(Router);

  ngOnInit(): void {
    // Duplicamos las tarjetas para simular bucle infinito

    this.productsSvc.getProductsForHeroCarousel()
    
    this.productsSvc.$products.subscribe({
      next: (products: IProduct[]) => {
        this.products = [...products, ...products ]
      }
    })
  }

  pauseCarousel() {
    this.paused = true;
  }

  resumeCarousel() {
    this.paused = false;
  }

  addProduct(product: IProduct){
    this.cartSvc.addProductToCart(product);
    this.toastSvc.success(`${product.description} - ${product.brand}`, "Producto agregado al carrito");
  }

  viewProductDetail(product: IProduct){
    if(product.idCategories[0]){
    this.routerSvc.navigate(["products", "category", product.idCategories[0], "product", product.id]);
  } else {
    // fallback si no hay categoría en la URL
    this.routerSvc.navigate(["products", product.id]);
  }
  }
}
