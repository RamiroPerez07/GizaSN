import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.css'
})
export class HeroCarouselComponent implements OnInit, OnDestroy, AfterViewInit {

  readonly routerSvc = inject(Router);

  readonly productsSvc = inject(ProductsService);

  redirectTo(path: string){
    this.routerSvc.navigate([path])
  }

  @ViewChild('carousel', { static: false }) carouselRef!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.updateTransform(), 0); // Espera al render completo
    }
  }

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

  tabletItems = [
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

  mobileItems = [
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1751242659/WhatsApp_Image_2025-06-29_at_21.14.37_2_u0fmr5.jpg',
      caption: 'Aumenta tu energía',
      redirectTo: () => {
        this.routerSvc.navigate(["products/category", "nutremax"])
      },
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1751242659/WhatsApp_Image_2025-06-29_at_21.14.37_1_b3yk0u.jpg',
      caption: "Aumenta tu energia",
      redirectTo: () => {
        this.routerSvc.navigate(["products/category", "nutremax"])
      },
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1751242659/WhatsApp_Image_2025-06-29_at_21.14.37_lvhuac.jpg',
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
      const isTablet = window.matchMedia('(max-width: 768px)').matches;
      const isMobile = window.matchMedia('(max-width: 468px)').matches;
      this.items = isMobile ? this.mobileItems : (isTablet ? this.tabletItems : this.desktopItems);
      this.currentIndex = 0;
      this.updateTransform();
    }
  }

  currentIndex = 0;
  transformValue: number = 0;

  private touchStartX = 0;
  private touchEndX = 0;

  // Función para mover al slide directamente desde los puntos
  moveSlideTo(index: number): void {
    this.currentIndex = index;
    this.updateTransform();
  }

  // Actualiza el valor de transformValue
  updateTransform(): void {
    if (isPlatformBrowser(this.platformId) && this.carouselRef?.nativeElement) {
        const width = this.carouselRef.nativeElement.offsetWidth;
        this.transformValue = -this.currentIndex * width;
      }
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
