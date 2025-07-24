import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { ICategory } from '../../interfaces/categories.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [],
  templateUrl: './categories-grid.component.html',
  styleUrl: './categories-grid.component.css'
})
export class CategoriesGridComponent implements OnInit, OnChanges {

  @Input() parentCategoryId!: string;
  
  @Input() title! : string;

  readonly productsSvc = inject(ProductsService);

  readonly router = inject(Router);

  categories! : ICategory[];

  ngOnInit(): void {
    this.productsSvc.$categories.subscribe({
      next: () => {
        this.updateCategories();
        //this.categories = this.productsSvc.getCategoriesByParent(this.parentCategoryId);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentCategoryId']) {
      this.updateCategories();
    }
  }

  updateCategories() {
    this.categories = this.productsSvc.getCategoriesByParent(this.parentCategoryId);
  }

  redirectTo(category: ICategory){
    this.router.navigate(['products', 'category', category.id]);
  }
  
}
