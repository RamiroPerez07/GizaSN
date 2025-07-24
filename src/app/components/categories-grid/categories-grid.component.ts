import { Component, inject, Input} from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { ICategory } from '../../interfaces/categories.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PointOfSaleService } from '../../services/point-of-sale.service';

@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-grid.component.html',
  styleUrl: './categories-grid.component.css'
})
export class CategoriesGridComponent {

  @Input() categories!: ICategory[];
  
  @Input() title! : string;

  readonly productsSvc = inject(ProductsService);

  readonly router = inject(Router);

  readonly posSvc = inject(PointOfSaleService);

  redirectTo(category: ICategory){
    this.router.navigate(['products', 'category', category.id]);
  }
  
}
