import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { ICategory } from '../../interfaces/categories.interface';
import { Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [],
  templateUrl: './categories-grid.component.html',
  styleUrl: './categories-grid.component.css'
})
export class CategoriesGridComponent implements OnInit, OnDestroy {

  @Input() parentCategoryId!: string;
  
  @Input() title! : string;

  readonly productsSvc = inject(ProductsService);

  readonly router = inject(Router);

  categories! : ICategory[];

  private sub!: Subscription;

  ngOnInit(): void {
    // Espera a que tanto las categorías como los allowed IDs estén listos
    this.sub = combineLatest([
      this.productsSvc.$categories,
      this.productsSvc.$allowedCategoryIds
    ]).subscribe(([categories, allowedIds]) => {
      if (categories.length && allowedIds.length) {
        // Filtra usando el método del servicio, que internamente ya respeta allowedIds
        this.updateCategories();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  updateCategories() {
    this.categories = this.productsSvc.getCategoriesByParent(this.parentCategoryId);
  }

  redirectTo(category: ICategory){
    this.router.navigate(['products', 'category', category.id]);
  }
  
}
