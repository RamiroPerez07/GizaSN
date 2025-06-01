import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.css'
})
export class HeroCarouselComponent implements OnInit, OnDestroy {

  readonly routerSvc = inject(Router);

  readonly productsSvc = inject(ProductsService);

  items! : {
    image: string,
    caption: string,
    redirectTo: Function
  }[]

  desktopItems = [
    { 
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1745728518/WhatsApp_Image_2025-04-26_at_21.31.11_sgnyqc.jpg', 
      caption: 'Running for fitness', 
      redirectTo: () => {
        this.routerSvc.navigate(["products/category", "nutremax"])
      } 
    },
    { 
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1745728518/WhatsApp_Image_2025-04-26_at_22.47.48_etffl4.jpg', 
      caption: 'Supplements for strength', 
      redirectTo: () => {} 
    },
    { 
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1745728519/WhatsApp_Image_2025-04-26_at_21.52.55_nedulp.jpg', 
      caption: 'Training hard in the gym', 
      redirectTo: () => {} 
    },
  ];

  mobileItems = [
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1748813291/WhatsApp_Image_2025-05-30_at_11.09.58_ydxyev.jpg',
      caption: 'Aumenta tu energía',
      redirectTo: () => {
        this.routerSvc.navigate(["products/category", "nutremax"])
      },
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1748813291/WhatsApp_Image_2025-05-30_at_11.07.32_1_wa36b0.jpg',
      caption: "Aumenta tu energia",
      redirectTo: () => {
        this.routerSvc.navigate(["products/category", "nutremax"])
      },
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1748813291/WhatsApp_Image_2025-05-30_at_11.07.32_jpsk0y.jpg',
      caption: "Aumenta tu energia",
      redirectTo: () => {
        this.routerSvc.navigate(["products/category", "nutremax"])
      },
    },
  ]

  readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateItemsForScreenSize();
      window.addEventListener('resize', this.updateItemsForScreenSize.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.updateItemsForScreenSize.bind(this));
    }
  }

  updateItemsForScreenSize(): void {
    if (typeof window !== 'undefined') {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      this.items = isMobile ? this.mobileItems : this.desktopItems;
      this.currentIndex = 0;
      this.updateTransform();
    }
  }

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
