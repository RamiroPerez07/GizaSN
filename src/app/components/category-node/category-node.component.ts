import { Component, inject, Input } from '@angular/core';
import { ICategory } from '../../interfaces/categories.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryTreeService } from '../../services/category-tree.service';
import { ProductsService } from '../../services/products.service';


@Component({
  selector: 'app-category-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-node.component.html',
  styleUrl: './category-node.component.css'
})
export class CategoryNodeComponent {
  @Input() allCategories: ICategory[] = [];
  @Input() parentId: string | null = null;

  private router = inject(Router);
  private categoryTreeSvc = inject(CategoryTreeService);

  constructor(private productsSvc: ProductsService) {}

  getChildren(parentId: string | null): ICategory[] {
    return this.productsSvc.getCategoriesByParentSync(this.allCategories, parentId);
  }

  hasChildren(category: ICategory): boolean {
    return this.getChildren(category.id).length > 0;
  }

  toggleCategory(category: ICategory & { showChildren?: boolean }) {
    if (this.hasChildren(category)) {
      category.showChildren = !category.showChildren;
    } else {
      // Navegar al detalle de categoría
      this.router.navigate(['products', 'category', category.id]);
      // Cerrar árbol de categorías
      this.categoryTreeSvc.toggleShowTree();
    }
  }
}
