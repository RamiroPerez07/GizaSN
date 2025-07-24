import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { ICategory } from '../../interfaces/categories.interface';
import { Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PointOfSaleService } from '../../services/point-of-sale.service';

@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-grid.component.html',
  styleUrl: './categories-grid.component.css'
})
export class CategoriesGridComponent implements OnInit, OnDestroy {

  @Input() parentCategoryId!: string;
  
  @Input() title! : string;

  readonly productsSvc = inject(ProductsService);

  readonly router = inject(Router);

  readonly posSvc = inject(PointOfSaleService);

  categories! : ICategory[];

  private sub!: Subscription;

  ngOnInit(): void {
    // Observa cambios tanto en la lista de categorías como en los allowedCategoryIds
    this.sub = combineLatest([
      this.productsSvc.$categories,
      this.productsSvc.$allowedCategoryIds,
      this.posSvc.$pos
    ]).subscribe(([categories, allowedIds, pos]) => {
      this.updateCategories();
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
