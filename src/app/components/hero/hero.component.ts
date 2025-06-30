import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeroCarouselComponent } from "../hero-carousel/hero-carousel.component";
import { BenefitsComponent } from "../benefits/benefits.component";
import { CardCarouselComponent } from "../card-carousel/card-carousel.component";

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, HeroCarouselComponent, BenefitsComponent, CardCarouselComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  
}
