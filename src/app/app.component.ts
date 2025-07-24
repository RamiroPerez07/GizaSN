import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { PointOfSaleService } from './services/point-of-sale.service';
import { FooterComponent } from "./components/footer/footer.component";
import { ProductsService } from './services/products.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'gizaFront';

  readonly activatedRute = inject(ActivatedRoute);

  readonly pointOfSaleSvc = inject(PointOfSaleService);

  readonly router = inject(Router);

  readonly productsSvc = inject(ProductsService);

  ngOnInit(): void {
    this.activatedRute.queryParams.subscribe(params => {

      const pv = params['pv'];

      if (pv !== undefined) {
        if (this.pointOfSaleSvc.isValidPv(pv)) {
          this.pointOfSaleSvc.setPv(pv);
        } else {
          this.pointOfSaleSvc.clearPv();
        }
      }

    });

    this.pointOfSaleSvc.pv$.subscribe({
      next: () => {
        const pos = this.pointOfSaleSvc.getCurrentPointOfSale();
        if(pos && pos.allowedCategoryIds){
          this.productsSvc.setAllowedCategories(pos.allowedCategoryIds);
        }
      }
    })
  }


}
