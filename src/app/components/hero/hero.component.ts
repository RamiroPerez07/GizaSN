import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeroCarouselComponent } from "../hero-carousel/hero-carousel.component";
import { BenefitsComponent } from "../benefits/benefits.component";

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, HeroCarouselComponent, BenefitsComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  
}
