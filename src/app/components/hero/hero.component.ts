import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HeroCarouselComponent } from "../hero-carousel/hero-carousel.component";
import { BenefitsComponent } from "../benefits/benefits.component";
import { CardCarouselComponent } from "../card-carousel/card-carousel.component";
import { Router } from '@angular/router';
import { CategoriesGridComponent } from "../categories-grid/categories-grid.component";
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { Subscription } from 'rxjs';
import { ICategory } from '../../interfaces/categories.interface';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, HeroCarouselComponent, BenefitsComponent, CardCarouselComponent, CategoriesGridComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {

  readonly routerSvc = inject(Router);

  readonly productsSvc = inject(ProductsService);

  products! :IProduct[];

  redirectTo(path: string){
    this.routerSvc.navigate([path])
  }

  sub! : Subscription;

  nutremaxCategories! : ICategory[];
  innovaCategories! : ICategory[];

  ngOnInit(): void {
    this.products = this.productsSvc.getProductsForHeroCarousel();

    this.sub = this.productsSvc.$categories.subscribe({
      next: (categories) => {
        this.nutremaxCategories = this.productsSvc.getCategoriesByParent('nutremax');
        this.innovaCategories = this.productsSvc.getCategoriesByParent('innovanaturals');
      }
    })
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

}
