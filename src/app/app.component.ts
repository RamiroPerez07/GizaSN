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
      this.pointOfSaleSvc.setPv(pv);
    });

    this.pointOfSaleSvc.$pos.subscribe(pos => {
      if (pos?.allowedCategoryIds?.length) {
        this.productsSvc.setAllowedCategories(pos.allowedCategoryIds);
      }
    });
  }


}
