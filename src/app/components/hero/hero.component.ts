import { CommonModule, isPlatformServer } from '@angular/common';
import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { HeroCarouselComponent } from "../hero-carousel/hero-carousel.component";
import { BenefitsComponent } from "../benefits/benefits.component";
import { CardCarouselComponent } from "../card-carousel/card-carousel.component";
import { Router } from '@angular/router';
import { CategoriesGridComponent } from "../categories-grid/categories-grid.component";
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { map, Observable, take } from 'rxjs';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, HeroCarouselComponent, BenefitsComponent, CardCarouselComponent, CategoriesGridComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {

  allowedIdsLoaded = false;

  ngOnInit() {
    this.productsSvc.allowedCategoryIds$.pipe(take(1)).subscribe(ids => {
      this.allowedIdsLoaded = ids.length > 0;
    });
  }

  private router = inject(Router);
  private productsSvc = inject(ProductsService);

  // Observable de productos para el carousel (ya definido en el service)
  heroProducts$: Observable<IProduct[]> = this.productsSvc.heroProducts$;

  categoriesGroups = [
    { title: 'Línea Nutremax', parentId: 'nutremax' },
    { title: 'Línea InnovaNaturals', parentId: 'innovanaturals' }
  ];

  // Observable que retorna un array de grupos de categorías
  categoriesGroups$ = this.productsSvc.categories$.pipe(
    map(categories => 
      this.categoriesGroups.map(group => ({
        title: group.title,
        categories: this.productsSvc.getCategoriesByParentSync(categories, group.parentId)
      }))
    )
  );

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  get isServer(): boolean {
    return isPlatformServer(this.platformId);
  }

  redirectTo(path: string){
    this.router.navigate([path]);
  }
}
