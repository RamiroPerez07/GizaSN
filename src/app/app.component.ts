import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { PointOfSaleService } from './services/point-of-sale.service';
import { FooterComponent } from "./components/footer/footer.component";
import { ProductsService } from './services/products.service';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'gizaFront';

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly pointOfSaleSvc = inject(PointOfSaleService);
  private readonly productsSvc = inject(ProductsService);

  ngOnInit(): void {
    // 1) Escuchar query param `pv` y enviar al servicio (reactivo)
    this.activatedRoute.queryParamMap
      .pipe(map(params => params.get('pv')))
      .subscribe(pv => this.pointOfSaleSvc.setPvFromUrl(pv));

    // 2) Cuando cambia el POS válido, actualizar allowedCategoryIds
    this.pointOfSaleSvc.pos$
      .pipe(
        filter((pos): pos is NonNullable<typeof pos> => !!pos),
        map(pos => pos.allowedCategoryIds ?? [])
      )
      .subscribe(allowedIds => {
        this.productsSvc.setAllowedCategories(allowedIds);
      });
  }
}
