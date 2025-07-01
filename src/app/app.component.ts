import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
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

  ngOnInit(): void {
  this.activatedRute.queryParams.subscribe(params => {
    const pv = params['pv'] || null;

    // Validamos antes de guardar
    if (pv && this.pointOfSaleSvc.isValidPv(pv)) {
      this.pointOfSaleSvc.setPv(pv);
    } else {
      this.pointOfSaleSvc.clearPv();
    }
  });
}


}
