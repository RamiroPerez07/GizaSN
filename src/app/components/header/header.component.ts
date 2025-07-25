import { Component, inject, OnInit } from '@angular/core';
import { ICategory } from '../../interfaces/categories.interface';
import { categories } from '../../data/categories';
import { CommonModule } from '@angular/common';
import { CategoryNodeComponent } from '../category-node/category-node.component';
import { CategoryTreeService } from '../../services/category-tree.service';
import { Router } from '@angular/router';
import { BRAND_IMAGES } from '../../utils/constants';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { PointOfSale } from '../../interfaces/pointofsale.interface';
import { ProductsService } from '../../services/products.service';
import { map, Observable, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, CategoryNodeComponent, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  readonly routerSvc = inject(Router);
  readonly categoryTreeSvc = inject(CategoryTreeService);
  readonly cartSvc = inject(CartService);
  readonly productsSvc = inject(ProductsService);

  headerLogoUrl: string = BRAND_IMAGES.logoHorizontalCompleto;

  // Reactividad para mostrar/ocultar árbol de categorías
  showTree$ = this.categoryTreeSvc.showTree$;

  categories$ = this.productsSvc.categories$;

  totalQuantity = toSignal(
    this.cartSvc.productsInCart$.pipe(
      map(products => products.reduce((acc, p) => acc + (p.quantity ?? 0), 0)),
      startWith(0)
    )
  );

  searchTerm: string = '';
  isSearchModalOpen = false;

  toggleShowTree() {
    this.categoryTreeSvc.toggleShowTree();
  }

  navigateToCart() {
    if ((this.totalQuantity() ?? 0) > 0) {
      this.routerSvc.navigate(['cart']);
    }
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.routerSvc.navigate(['/products'], { queryParams: { search: this.searchTerm.trim() } });
      this.closeSearchModal();
    }
  }

  openSearchModal() {
    this.isSearchModalOpen = true;
  }

  closeSearchModal() {
    this.isSearchModalOpen = false;
  }
}
