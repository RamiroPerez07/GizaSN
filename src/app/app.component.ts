import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { PointOfSaleService } from './services/point-of-sale.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'gizaFront';

  readonly activatedRute = inject(ActivatedRoute);

  readonly pointOfSaleSvc = inject(PointOfSaleService);

  readonly router = inject(Router);

  ngOnInit(): void {
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      const pv = this.activatedRute.snapshot.queryParams['pv'];

      if (pv !== undefined) {
        if (this.pointOfSaleSvc.isValidPv(pv)) {
          this.pointOfSaleSvc.setPv(pv);
        } else {
          this.pointOfSaleSvc.clearPv();
        }
      }
    }
  });
  }


}
