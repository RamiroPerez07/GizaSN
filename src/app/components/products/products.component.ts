import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  readonly productsSvc = inject(ProductsService);

  readonly cartSvc = inject(CartService);

  readonly toastSvc = inject(ToastrService);

  products! : IProduct[];

  ngOnInit(): void {
    this.productsSvc.$products.subscribe({
      next: (products: IProduct[]) => {
        this.products = products;
      }
    })
  }

  addProduct(product: IProduct){
    this.cartSvc.addProductToCart(product);
    this.toastSvc.success(`${product.description} - ${product.brand}`, "Producto agregado al carrito")
  }

}
