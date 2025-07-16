import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { CardCarouselComponent } from "../card-carousel/card-carousel.component";

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, CardCarouselComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {

  
  readonly routerSvc = inject(Router)
  
  productId: string | null = null;

  categoryId: string | null = null;
  
  product!: IProduct | undefined;

  relatedProducts: IProduct[] = [];

  breadcrumbRoutes! : {name: string, redirectFx: Function}[] 

  readonly productsSvc = inject(ProductsService);

  readonly cartSvc = inject(CartService);

  readonly toastSvc = inject(ToastrService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      this.categoryId = params.get('categoryId');
      this.product = this.productsSvc.getProductById(Number(this.productId));
      if(this.product){

        const categoriesPath = this.productsSvc.getCategoryPath(this.categoryId ?? this.product.idCategories[0]); // asumo que usas la primera categoría

        this.breadcrumbRoutes = [
          {
            name: "Inicio",
            redirectFx: () => this.routerSvc.navigate([""])
          },
          {
            name: "Productos",
            redirectFx: () => this.routerSvc.navigate(["products"])
          },
          ...categoriesPath.map(cat => ({
          name: cat.title,
          redirectFx: () => this.routerSvc.navigate(['products/category', cat.id])
          })),
          {
            name: this.product.description,
            redirectFx: () => this.routerSvc.navigate(["products", this.product?.id])
          },
        ];

        if(this.product.relatedProductsIds && this.product.relatedProductsIds.length>0){
          this.relatedProducts = this.productsSvc.getProductsByIds(this.product.relatedProductsIds);
        }

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



