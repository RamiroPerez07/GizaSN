import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.css'
})
export class HeroCarouselComponent {
  items = [
    { image: 'https://images.pexels.com/photos/4181706/pexels-photo-4181706.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500', caption: 'Running for fitness' },
    { image: 'https://images.pexels.com/photos/798768/pexels-photo-798768.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500', caption: 'Supplements for strength' },
    { image: 'https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500', caption: 'Training hard in the gym' },
    { image: 'https://images.pexels.com/photos/6001390/pexels-photo-6001390.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500', caption: 'Nutrition and supplements' },
    { image: 'https://images.pexels.com/photos/4193612/pexels-photo-4193612.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500', caption: 'Gym workouts for success' }
  ];

  currentIndex = 0;
  transformValue = 0;

  // Función para mover al slide directamente desde los puntos
  moveSlideTo(index: number): void {
    this.currentIndex = index;
    this.updateTransform();
  }

  // Actualiza el valor de transformValue
  updateTransform(): void {
    this.transformValue = -100 * this.currentIndex;
  }
}
