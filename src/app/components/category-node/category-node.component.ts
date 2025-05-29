import { Component, inject, Input } from '@angular/core';
import { ICategory } from '../../interfaces/categories.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryTreeService } from '../../services/category-tree.service';


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

  readonly router = inject(Router);

  readonly categoryTreeSvc = inject(CategoryTreeService)

  toggleCategory(category: ICategory & { showChildren?: boolean }) {
    const hasChild = this.hasChildren(category);

    if (hasChild) {
      // Solo expande/colapsa
      category.showChildren = !category.showChildren;
    } else {
      // Si no tiene hijos, navega
      this.router.navigate(['products', 'category', category.id]);
      this.categoryTreeSvc.toggleShowTree()
    }
  }

  getChildren(parentId: string | null): ICategory[] {
    return this.allCategories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.priority - b.priority);
  }

  hasChildren(category: ICategory): boolean {
    return this.allCategories.some(cat => cat.parentId === category.id);
  }
}
