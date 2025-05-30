import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.css'
})
export class HeroCarouselComponent {

  readonly routerSvc = inject(Router);

  readonly productsSvc = inject(ProductsService);

  items = [
    { 
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1745728518/WhatsApp_Image_2025-04-26_at_21.31.11_sgnyqc.jpg', 
      caption: 'Running for fitness', 
      redirectTo: () => {
        this.routerSvc.navigate(["products/category", "1.2"])
      } 
    },
    { image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1745728518/WhatsApp_Image_2025-04-26_at_22.47.48_etffl4.jpg', caption: 'Supplements for strength', redirectTo: () => {} },
    { image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1745728519/WhatsApp_Image_2025-04-26_at_21.52.55_nedulp.jpg', caption: 'Training hard in the gym', redirectTo: () => {} },
  ];

  

  currentIndex = 0;
  transformValue = 0;

  private touchStartX = 0;
  private touchEndX = 0;

  // Función para mover al slide directamente desde los puntos
  moveSlideTo(index: number): void {
    this.currentIndex = index;
    this.updateTransform();
  }

  // Actualiza el valor de transformValue
  updateTransform(): void {
    this.transformValue = -100 * this.currentIndex;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent): void {
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchEnd(): void {
    const delta = this.touchEndX - this.touchStartX;

    if (Math.abs(delta) > 50) { // umbral mínimo de swipe
      if (delta < 0) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
    }
  }

  nextSlide(): void {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      this.updateTransform();
    }
  }

  previousSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateTransform();
    }
  }

}
