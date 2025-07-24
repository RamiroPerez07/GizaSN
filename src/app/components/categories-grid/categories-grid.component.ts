import { Component, inject, Input, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { ICategory } from '../../interfaces/categories.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [],
  templateUrl: './categories-grid.component.html',
  styleUrl: './categories-grid.component.css'
})
export class CategoriesGridComponent implements OnInit {

  @Input() parentCategoryId!: string;
  
  @Input() title! : string;

  readonly productsSvc = inject(ProductsService);

  readonly router = inject(Router);

  categories! : ICategory[];

  ngOnInit(): void {
    this.productsSvc.$categories.subscribe({
      next: () => {
        this.categories = this.productsSvc.getCategoriesByParent(this.parentCategoryId);
      }
    })
  }

  redirectTo(category: ICategory){
    this.router.navigate(['products', 'category', category.id]);
  }
}
