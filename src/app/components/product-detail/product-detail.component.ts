import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {

  
  readonly routerSvc = inject(Router)
  
  productId: string | null = null;
  
  product!: IProduct | undefined;

  breadcrumbRoutes! : {name: string, redirectFx: Function}[] 

  readonly productsSvc = inject(ProductsService);

  readonly cartSvc = inject(CartService);

  readonly toastSvc = inject(ToastrService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      this.product = this.productsSvc.getProductById(Number(this.productId));
      if(this.product){
        this.breadcrumbRoutes = [
          {
            name: "Inicio",
            redirectFx: () => this.routerSvc.navigate([""])
          },
          {
            name: "Productos",
            redirectFx: () => this.routerSvc.navigate(["products"])
          },
          {
            name: this.product.description,
            redirectFx: () => this.routerSvc.navigate(["products", this.product?.id])
          },
        ];
      }else{
        this.routerSvc.navigate(["products"]);
      }
    });

  }

  addProduct(product: IProduct){
    this.cartSvc.addProductToCart(product);
    this.toastSvc.success(`${product.description} - ${product.brand}`, "Producto agregado al carrito");
  }


}



