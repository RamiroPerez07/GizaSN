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


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, CategoryNodeComponent, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  
  categories: ICategory[] = categories;

  showTree!: boolean;

  headerLogoUrl : string = BRAND_IMAGES.logoHorizontalCompleto;

  totalQuantity ! : number;

  readonly routerSvc = inject(Router);

  readonly categoryTreeSvc = inject(CategoryTreeService);

  readonly cartSvc = inject(CartService);

  ngOnInit(): void {
    this.categoryTreeSvc.$showTree.subscribe({
      next: (showTree: boolean) => {
        this.showTree = showTree;
      }
    })

    this.cartSvc.$productsInCart.subscribe({
      next: (productsInCart) => {
        this.totalQuantity = productsInCart.reduce((acc,p) => acc + (p.quantity ?? 0) ,0); 
      }
    })
  }

  toggleShowTree(){
    this.categoryTreeSvc.toggleShowTree();
  }

  navigateToCart(){
    if(this.totalQuantity>0){
      this.routerSvc.navigate(['cart'])
    }
  }

  searchTerm: string = '';

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.routerSvc.navigate(['/products'], { queryParams: { search: this.searchTerm.trim() } });
    }
  }

  isSearchModalOpen = false;

  openSearchModal() {
    this.isSearchModalOpen = true;
  }

  closeSearchModal() {
    this.isSearchModalOpen = false;
  }
  
}
