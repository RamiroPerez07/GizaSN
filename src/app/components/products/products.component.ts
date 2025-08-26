import { Component, inject } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  private readonly productsSvc = inject(ProductsService);
  private readonly routerSvc = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isSmallView = true;

  toggleView() {
    this.isSmallView = !this.isSmallView;
  }

  // params$ reacciona a cambios de URL
  readonly params$ = combineLatest([
    this.route.paramMap,
    this.route.queryParams
  ]).pipe(
    tap(([params, query]) => {
      const categoryId = params.get('categoryId');
      const search = (query['search'] || '').trim();
      this.productsSvc.setSearch(search);
      this.productsSvc.filterByCategory(categoryId);
    })
  );

  // view model reactivo
  readonly vm$ = this.params$.pipe(
    switchMap(([params, query]) => {
      const categoryId = params.get('categoryId');
      const search = (query['search'] || '').trim();

      return combineLatest([
        this.productsSvc.products$,
        categoryId
          ? this.productsSvc.getCategoryPath(categoryId)
          : this.productsSvc.getCategoryPath(''), // vacío si no hay categoría
      ]).pipe(
        map(([products, categoryPath]) => {
          const subtitle = search
            ? `Resultados para: "${search}"`
            : categoryPath.length > 0
            ? categoryPath.map(c => c.title).join(' - ')
            : 'Catálogo de productos';

          const breadcrumbRoutes = search
            ? [
                { name: 'Inicio', redirectFx: () => this.routerSvc.navigate(['']) },
                { name: 'Productos', redirectFx: () => this.routerSvc.navigate(['products']) },
                { name: `Buscar: "${search}"`, redirectFx: () => {} }
              ]
            : categoryPath.length > 0
            ? [
                { name: 'Inicio', redirectFx: () => this.routerSvc.navigate(['']) },
                { name: 'Productos', redirectFx: () => this.routerSvc.navigate(['products']) },
                ...categoryPath.map(cat => ({
                  name: cat.title,
                  redirectFx: () => this.routerSvc.navigate(['products', 'category', cat.id])
                }))
              ]
            : [
                { name: 'Inicio', redirectFx: () => this.routerSvc.navigate(['']) },
                { name: 'Productos', redirectFx: () => this.routerSvc.navigate(['products']) }
              ];

          return {
            products,
            categoryId,
            subtitle,
            breadcrumbRoutes,
            title: 'Catálogo de productos'
          };
        })
      );
    })
  );
}