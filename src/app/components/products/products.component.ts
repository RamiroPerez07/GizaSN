import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { ICategory } from '../../interfaces/categories.interface';

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

  category! :ICategory | null;

  ngOnInit(): void {

    this.router.paramMap.subscribe(params => {
      this.categoryId = params.get('categoryId');

      if(this.categoryId){
        this.productsSvc.filterProductsByCategory(this.categoryId);
        this.category = this.productsSvc.findCategoryById(this.categoryId);
        if(this.category){
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
              name: `${this.category.txt_category}`,
              redirectFx: () => this.routerSvc.navigate(["products/category", `${this.category?.id}`])
            },
        ]
      }
      }else{
        this.productsSvc.getAllProducts();
      }
      this.productsSvc.$products.subscribe({
        next: (products: IProduct[]) => {
          this.products = products;
        }
      })
    })

  }

  addProduct(product: IProduct){
    this.cartSvc.addProductToCart(product);
    this.toastSvc.success(`${product.description} - ${product.brand}`, "Producto agregado al carrito");
  }

  viewProductDetail(product: IProduct){
    this.routerSvc.navigate(["products", product.id])
  }

}
