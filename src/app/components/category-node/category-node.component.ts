import { Component, inject, Input, OnInit } from '@angular/core';
import { ICategory } from '../../interfaces/categories.interface';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { Router } from '@angular/router';
import { CategoryTreeService } from '../../services/category-tree.service';

@Component({
  selector: 'app-category-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-node.component.html',
  styleUrl: './category-node.component.css'
})
export class CategoryNodeComponent implements OnInit {
  @Input() category!: ICategory;

  readonly productsSvc = inject(ProductsService);

  readonly router = inject(Router);

  readonly categoryTreeSvc = inject(CategoryTreeService);

  showTree! : boolean;

  ngOnInit(): void {
    this.categoryTreeSvc.$showTree.subscribe({
      next: (showTree: boolean) => {
        this.showTree = showTree;
      }
    })
  }


  onCategoryClick(category: ICategory): void {
    if (category.children && category.children.length > 0) {
      category.showChildren = !category.showChildren;
    } else {
      this.router.navigate(["products/category",`${category.id}`])
      this.categoryTreeSvc.toggleShowTree();
    }
  }
}
