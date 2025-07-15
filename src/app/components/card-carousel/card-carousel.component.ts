import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { IProduct } from '../../interfaces/products.interface';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-card-carousel',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './card-carousel.component.html',
  styleUrl: './card-carousel.component.css'
})
export class CardCarouselComponent {

  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef<HTMLDivElement>;

  animationId: number | null = null;

  currentTranslate = 0;
  isDragging = false;
  dragged = false;          // <--- Flag para saber si hubo desplazamiento
  startX = 0;
  prevTranslate = 0;
  speed = 0.5; // px por frame (ajustalo)

  products! :IProduct[];

  readonly productsSvc = inject(ProductsService);
  readonly cartSvc = inject(CartService);
  readonly toastSvc = inject(ToastrService);
  readonly routerSvc = inject(Router);

  @ViewChildren(ProductCardComponent) productCards!: QueryList<ProductCardComponent>;

  ngOnInit(): void {
    // Duplicamos las tarjetas para simular bucle infinito

    this.productsSvc.getProductsForHeroCarousel()
    
    this.productsSvc.$products.subscribe({
      next: (products: IProduct[]) => {
        this.products = [...products, ...products ]
      }
    })
  }

  ngAfterViewInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  startAutoScroll() {
    const step = () => {
      if (!this.isDragging) {
        this.currentTranslate -= this.speed;
        // Si llegás a mitad del ancho (duplicado), resetear
        const track = this.carouselTrack.nativeElement;
        const maxTranslate = track.scrollWidth / 2;
        if (-this.currentTranslate >= maxTranslate) {
          this.currentTranslate = 0;
        }
        track.style.transform = `translateX(${this.currentTranslate}px)`;
      }
      this.animationId = requestAnimationFrame(step);
    };
    this.animationId = requestAnimationFrame(step);
  }

  stopAutoScroll() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // TOUCH

  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.dragged = false;           // resetear flag al empezar
    this.startX = event.touches[0].clientX;
    this.prevTranslate = this.currentTranslate;
    this.stopAutoScroll();
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    const currentX = event.touches[0].clientX;
    const deltaX = currentX - this.startX;
    if (Math.abs(deltaX) > 5) {
      this.dragged = true;           // hubo desplazamiento
    }
    this.currentTranslate = this.prevTranslate + deltaX;
    this.carouselTrack.nativeElement.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  onTouchEnd() {
    this.isDragging = false;
    this.startAutoScroll();
  }

  // CLICK PROTEGIDO POR DRAG

  onCardClick = (event: MouseEvent, product: IProduct) => {
    if (this.dragged) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const card = this.productCards.find(pc => pc.product.id === product.id);
    if (card) {
      card.viewProductDetail(product, product.idCategories[0]);
    }
  }



  // Variables para mouse
  // MOUSE

  private isMouseDragging = false;

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.isMouseDragging = true;
    this.dragged = false;            // resetear flag
    this.startX = event.clientX;
    this.prevTranslate = this.currentTranslate;
    this.stopAutoScroll();
    event.preventDefault(); // para evitar selección de texto, etc
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging || !this.isMouseDragging) return;
    const currentX = event.clientX;
    const deltaX = currentX - this.startX;
    if (Math.abs(deltaX) > 5) {
      this.dragged = true;           // hubo desplazamiento
    }
    this.currentTranslate = this.prevTranslate + deltaX;
    this.carouselTrack.nativeElement.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  onMouseUp() {
    if (!this.isMouseDragging) return;
    this.isDragging = false;
    this.isMouseDragging = false;
    this.startAutoScroll();
  }

  onMouseLeave() {
    if (this.isMouseDragging) {
      this.onMouseUp();
    }
  }

  onMouseLeaveHandler(event: MouseEvent) {
    if (this.isMouseDragging) {
      this.onMouseUp();
    }
    this.resumeCarousel();
  }

  pauseCarousel() {
    this.isDragging = true;
    this.stopAutoScroll();
  }

  resumeCarousel() {
    this.isDragging = false;
    this.startAutoScroll();
  }
}
