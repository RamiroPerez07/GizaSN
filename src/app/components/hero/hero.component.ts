import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HeroCarouselComponent } from "../hero-carousel/hero-carousel.component";
import { BenefitsComponent } from "../benefits/benefits.component";
import { CardCarouselComponent } from "../card-carousel/card-carousel.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, HeroCarouselComponent, BenefitsComponent, CardCarouselComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {

  readonly routerSvc = inject(Router);

  redirectTo(path: string){
    this.routerSvc.navigate([path])
  }
}
