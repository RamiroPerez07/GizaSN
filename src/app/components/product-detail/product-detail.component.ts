import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { CardCarouselComponent } from "../card-carousel/card-carousel.component";
import { combineLatest, map, of, switchMap } from 'rxjs';
import { ConsultingSectionComponent } from "../consulting-section/consulting-section.component";

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, CardCarouselComponent, ConsultingSectionComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  private readonly productsSvc = inject(ProductsService);
  private readonly cartSvc = inject(CartService);
  private readonly toastSvc = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  roundTo100 = (value: number) => Math.ceil(value / 100) * 100;

  readonly vm$ = this.route.paramMap.pipe(
    switchMap(params => {
      const id = Number(params.get('id'));
      const categoryId = params.get('categoryId');

      return this.productsSvc.getProductById(id).pipe(
        switchMap(product => {
          if (!product) {
            this.router.navigate(['products']);
            return of(null);
          }

          const path$ = this.productsSvc.getCategoryPath(categoryId ?? product.idCategories[0]);
          const related$ = product.relatedProductsIds?.length
            ? this.productsSvc.getProductsByIds(product.relatedProductsIds)
            : of([]);

          return combineLatest([path$, related$]).pipe(
            map(([path, relatedProducts]) => ({
              product,
              relatedProducts,
              breadcrumbRoutes: [
                { name: 'Inicio', redirectFx: () => this.router.navigate(['']) },
                { name: 'Productos', redirectFx: () => this.router.navigate(['products']) },
                ...path.map(cat => ({
                  name: cat.title,
                  redirectFx: () => this.router.navigate(['products/category', cat.id])
                })),
                { name: product.description, redirectFx: () => {} }
              ]
            }))
          );
        })
      );
    })
  );

  addProduct(product: IProduct) {
    this.cartSvc.addProductToCart(product);
    this.toastSvc.success(`${product.description} - ${product.brand}`, "Producto agregado al carrito");
  }
}



