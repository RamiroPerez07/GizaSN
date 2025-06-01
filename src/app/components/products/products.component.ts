import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { ICategory } from '../../interfaces/categories.interface';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  readonly productsSvc = inject(ProductsService);

  readonly cartSvc = inject(CartService);

  readonly toastSvc = inject(ToastrService);

  readonly routerSvc = inject(Router);

  readonly router = inject(ActivatedRoute);

  categoryId! : string | null;

  products! : IProduct[];

  breadcrumbRoutes : {name: string, redirectFx: Function}[] = [
    {
      name: "Inicio",
      redirectFx: () => this.routerSvc.navigate([""])
    },
    {
      name: "Productos",
      redirectFx: () => this.routerSvc.navigate(["products"])
    }
  ]

  category! :ICategory | undefined;

  title : string = "Catálogo de productos"

  subtitle!: string

  ngOnInit(): void {
    combineLatest([this.router.paramMap, this.router.queryParams])
      .subscribe(([params, queryParams]) => {
        const searchTerm = (queryParams['search'] || '').trim();
        this.categoryId = params.get('categoryId');

        if (searchTerm) {
          // Filtrar solo por búsqueda
          this.productsSvc.filterProductsBySearch(searchTerm);
          this.subtitle = `Resultados para: "${searchTerm}"`;
          this.breadcrumbRoutes = [
            { name: "Inicio", redirectFx: () => this.routerSvc.navigate([""]) },
            { name: "Productos", redirectFx: () => this.routerSvc.navigate(["products"]) },
            { name: `Buscar: "${searchTerm}"`, redirectFx: () => {} }
          ];
        } else if (this.categoryId) {
          // Filtrar solo por categoría
          this.productsSvc.filterProductsByCategory(this.categoryId);
          this.category = this.productsSvc.findCategoryById(this.categoryId);
          if (this.category) {
            this.subtitle = this.productsSvc.getCategoryPath(this.categoryId).map(cat => cat.title).join(" - ");
            this.breadcrumbRoutes = [
              { name: "Inicio", redirectFx: () => this.routerSvc.navigate([""]) },
              { name: "Productos", redirectFx: () => this.routerSvc.navigate(["products"]) },
              ...this.productsSvc.getCategoryPath(this.categoryId).map(cat => ({
                name: cat.title,
                redirectFx: () => this.routerSvc.navigate(['products', 'category', cat.id])
              })),
            ];
          }
        } else {
          // Sin filtro, mostrar todo
          this.productsSvc.getAllProducts();
          this.subtitle = "Catálogo de productos";
          this.breadcrumbRoutes = [
            { name: "Inicio", redirectFx: () => this.routerSvc.navigate([""]) },
            { name: "Productos", redirectFx: () => this.routerSvc.navigate(["products"]) }
          ];
        }

        this.productsSvc.$products.subscribe({
          next: (products: IProduct[]) => this.products = products
        });
      }
    );
  }

  addProduct(product: IProduct){
    this.cartSvc.addProductToCart(product);
    this.toastSvc.success(`${product.description} - ${product.brand}`, "Producto agregado al carrito");
  }

  viewProductDetail(product: IProduct){
  if(this.categoryId){
    this.routerSvc.navigate(["products", "category", this.categoryId, "product", product.id]);
  } else {
    // fallback si no hay categoría en la URL
    this.routerSvc.navigate(["products", product.id]);
  }
}

}
