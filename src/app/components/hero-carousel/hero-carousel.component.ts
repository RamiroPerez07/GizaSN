import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

interface CarouselItem {
  image: string;
  caption: string;
  path: string[];
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.css'
})
export class HeroCarouselComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('carousel', { static: false }) carouselRef!: ElementRef<HTMLElement>;

  items: CarouselItem[] = [];

  currentIndex = 0;
  transformValue = 0;

  private touchStartX = 0;
  private touchEndX = 0;
  private resizeHandler = this.updateItemsForScreenSize.bind(this);

  readonly desktopItems: CarouselItem[] = [
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1745728518/WhatsApp_Image_2025-04-26_at_21.31.11_sgnyqc.jpg',
      caption: 'Running for fitness',
      path: ['products/category', 'nutremax'],
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1745728518/WhatsApp_Image_2025-04-26_at_22.47.48_etffl4.jpg',
      caption: 'Supplements for strength',
      path: ['products/category', 'nutremax'],
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1745728519/WhatsApp_Image_2025-04-26_at_21.52.55_nedulp.jpg',
      caption: 'Training hard in the gym',
      path: ['products/category', 'nutremax'],
    },
  ];

  readonly tabletItems: CarouselItem[] = [
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1748813291/WhatsApp_Image_2025-05-30_at_11.09.58_ydxyev.jpg',
      caption: 'Aumenta tu energía',
      path: ['products/category', 'nutremax'],
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1748813291/WhatsApp_Image_2025-05-30_at_11.07.32_1_wa36b0.jpg',
      caption: 'Aumenta tu energía',
      path: ['products/category', 'nutremax'],
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1748813291/WhatsApp_Image_2025-05-30_at_11.07.32_jpsk0y.jpg',
      caption: 'Aumenta tu energía',
      path: ['products/category', 'nutremax'],
    },
  ];

  readonly mobileItems: CarouselItem[] = [
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1751242659/WhatsApp_Image_2025-06-29_at_21.14.37_2_u0fmr5.jpg',
      caption: 'Aumenta tu energía',
      path: ['products/category', 'nutremax'],
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1751242659/WhatsApp_Image_2025-06-29_at_21.14.37_1_b3yk0u.jpg',
      caption: 'Aumenta tu energía',
      path: ['products/category', 'nutremax'],
    },
    {
      image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1751242659/WhatsApp_Image_2025-06-29_at_21.14.37_lvhuac.jpg',
      caption: 'Aumenta tu energía',
      path: ['products/category', 'nutremax'],
    },
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateItemsForScreenSize();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const observer = new ResizeObserver(() => this.updateTransform());
    observer.observe(this.carouselRef.nativeElement);
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('resize', this.resizeHandler);
  }

  updateItemsForScreenSize(): void {
    const isMobile = window.matchMedia('(max-width: 468px)').matches;
    const isTablet = window.matchMedia('(max-width: 768px)').matches;
    this.items = isMobile ? this.mobileItems : isTablet ? this.tabletItems : this.desktopItems;
    this.currentIndex = 0;
    this.updateTransform();
  }

  moveSlideTo(index: number): void {
    this.currentIndex = index;
    this.updateTransform();
  }

  updateTransform(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const width = this.carouselRef?.nativeElement?.getBoundingClientRect().width || 0;
    this.transformValue = -this.currentIndex * width;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent): void {
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchEnd(): void {
    const delta = this.touchEndX - this.touchStartX;
    if (Math.abs(delta) > 50) {
      delta < 0 ? this.nextSlide() : this.previousSlide();
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

  navigateTo(path: string[] = []): void {
    if (path.length > 0) {
      this.router.navigate(path);
    }
  }

  navigateToProducts(): void {
    this.router.navigate(['products']);
  }

}
