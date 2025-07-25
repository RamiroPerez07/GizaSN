import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PointOfSaleService } from '../../services/point-of-sale.service';
import { PointOfSale } from '../../interfaces/pointofsale.interface';

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
  private readonly posSvc = inject(PointOfSaleService);

  @ViewChild('carousel', { static: false }) carouselRef!: ElementRef<HTMLElement>;

  items: CarouselItem[] = [];

  readonly pos$ = this.posSvc.pos$; // <-- ahora observable, sin subscribe manual

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
    // {
    //   image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1751242659/WhatsApp_Image_2025-06-29_at_21.14.37_2_u0fmr5.jpg',
    //   caption: 'Aumenta tu energía',
    //   path: ['products/category', 'nutremax'],
    // },
    // {
    //   image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1751242659/WhatsApp_Image_2025-06-29_at_21.14.37_1_b3yk0u.jpg',
    //   caption: 'Aumenta tu energía',
    //   path: ['products/category', 'nutremax'],
    // },
    // {
    //   image: 'https://res.cloudinary.com/dhnicvwkw/image/upload/v1751242659/WhatsApp_Image_2025-06-29_at_21.14.37_lvhuac.jpg',
    //   caption: 'Aumenta tu energía',
    //   path: ['products/category', 'nutremax'],
    // },
    {
      image: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1753273013/9_zyphak.png",
      caption: 'Aumenta tu energia',
      path: ['products/category', 'nutremax-aminoacidos'],
    },
    {
      image: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1753273014/14_seq0gs.png",
      caption: 'Aumenta tu energia',
      path: ['products/category', 'nutremax-energizantes'],
    },
    {
      image: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1753273014/11_taag8d.png",
      caption: 'Aumenta tu energia',
      path: ['products/category', 'nutremax-aminoacidos'],
    },
    {
      image: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1753273014/12_jyqmmp.png",
      caption: 'Aumenta tu energia',
      path: ['products/category', 'nutremax-energizantes'],
    },
    {
      image: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1753273013/8_rguqka.png",
      caption: 'Aumenta tu energia',
      path: ['products/category', 'nutremax-energizantes'],
    }
  ];

  currentIndex = 0;
  transformValue = 0;

  private resizeHandler = this.updateItemsForScreenSize.bind(this);

  // Drag vars
  private isDragging = false;
  private startX = 0;
  private prevTranslate = 0;
  private animationFrameId: number | null = null;

  // Para detectar si hubo desplazamiento (drag)
  private dragged = false;

  // Guarda el total deltaX para decidir swipe
  private totalDeltaX = 0;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateItemsForScreenSize();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.setPositionByIndex();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('resize', this.resizeHandler);
    this.cancelAnimation();
  }

  updateItemsForScreenSize(): void {
    const isMobile = window.matchMedia('(max-width: 468px)').matches;
    const isTablet = window.matchMedia('(max-width: 768px)').matches;
    this.items = isMobile ? this.mobileItems : isTablet ? this.tabletItems : this.desktopItems;
    this.currentIndex = 0;
    this.setPositionByIndex();
  }

  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.dragged = false;
    this.totalDeltaX = 0;
    this.startX = event.touches[0].clientX;
    this.prevTranslate = this.transformValue;
    this.cancelAnimation();
    this.setTransform(this.transformValue, false);
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    const currentX = event.touches[0].clientX;
    const deltaX = currentX - this.startX;
    this.totalDeltaX = deltaX;
    if (Math.abs(deltaX) > 5) {
      this.dragged = true;
    }
    this.transformValue = this.prevTranslate + deltaX;
    this.setTransform(this.transformValue, false);
  }

  onTouchEnd() {
    this.isDragging = false;
    this.snapToClosestSlide();
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.dragged = false;
    this.totalDeltaX = 0;
    this.startX = event.clientX;
    this.prevTranslate = this.transformValue;
    this.cancelAnimation();
    event.preventDefault();
    this.setTransform(this.transformValue, false);
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const currentX = event.clientX;
    const deltaX = currentX - this.startX;
    this.totalDeltaX = deltaX;
    if (Math.abs(deltaX) > 5) {
      this.dragged = true;
    }
    this.transformValue = this.prevTranslate + deltaX;
    this.setTransform(this.transformValue, false);
  }

  onMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.snapToClosestSlide();
  }

  onMouseLeave() {
    if (this.isDragging) {
      this.isDragging = false;
      this.snapToClosestSlide();
    }
  }

  private snapToClosestSlide() {
    if (!this.carouselRef) return;
    const width = this.carouselRef.nativeElement.getBoundingClientRect().width;
    const swipeThreshold = width * 0.15;

    if (this.totalDeltaX > swipeThreshold) {
      this.currentIndex = Math.max(this.currentIndex - 1, 0);
    } else if (this.totalDeltaX < -swipeThreshold) {
      this.currentIndex = Math.min(this.currentIndex + 1, this.items.length - 1);
    }
    this.animateToIndex(this.currentIndex);
    this.totalDeltaX = 0;
  }

  public animateToIndex(index: number) {
    if (!this.carouselRef) return;
    const width = this.carouselRef.nativeElement.getBoundingClientRect().width;
    const target = -index * width;
    this.currentIndex = index;
    const durationMs = 700;
    this.setTransformWithDuration(target, durationMs);
  }

  private setTransformWithDuration(value: number, durationMs: number) {
    if (!this.carouselRef) return;
    const el = this.carouselRef.nativeElement;
    el.style.transition = `transform ${durationMs}ms ease-in-out`;
    el.style.transform = `translateX(${value}px)`;
    this.transformValue = value;
  }

  private setPositionByIndex() {
    if (!this.carouselRef) return;
    const width = this.carouselRef.nativeElement.getBoundingClientRect().width;
    this.transformValue = -this.currentIndex * width;
    this.setTransform(this.transformValue, false);
  }

  private setTransform(value: number, withTransition: boolean = false) {
    if (!this.carouselRef) return;
    const el = this.carouselRef.nativeElement;
    el.style.transition = withTransition ? 'transform 0.5s ease-in-out' : 'none';
    el.style.transform = `translateX(${value}px)`;
    this.transformValue = value;
  }

  private cancelAnimation() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  onImageClick(event: MouseEvent, path: string[]) {
    if (this.dragged) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.navigateTo(path);
  }

  navigateTo(path: string[] = []) {
    if (path.length) this.router.navigate(path);
  }

  navigateToProducts() {
    this.router.navigate(['products']);
  }
}
