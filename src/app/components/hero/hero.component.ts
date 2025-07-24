import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { HeroCarouselComponent } from "../hero-carousel/hero-carousel.component";
import { BenefitsComponent } from "../benefits/benefits.component";
import { CardCarouselComponent } from "../card-carousel/card-carousel.component";
import { Router } from '@angular/router';
import { CategoriesGridComponent } from "../categories-grid/categories-grid.component";
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, HeroCarouselComponent, BenefitsComponent, CardCarouselComponent, CategoriesGridComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit {

  readonly routerSvc = inject(Router);

  readonly productsSvc = inject(ProductsService);

  products! :IProduct[];

  redirectTo(path: string){
    this.routerSvc.navigate([path])
  }

  ngOnInit(): void {
      this.products = this.productsSvc.getProductsForHeroCarousel();
    }

}
