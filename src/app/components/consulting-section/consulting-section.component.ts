import { Component, Input, OnInit } from '@angular/core';
import { IProduct } from '../../interfaces/products.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consulting-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consulting-section.component.html',
  styleUrl: './consulting-section.component.css'
})
export class ConsultingSectionComponent implements OnInit {
  @Input() product?: IProduct;

  @Input() alignLeft: boolean = false;

  hrefUrl!: string;

  ngOnInit(): void {
    if (this.product) {
      this.hrefUrl = 'https://wa.me/3364358745?text=' +
        encodeURIComponent(
          `Hola Clara! Me gustaría recibir asesoramiento acerca del producto ${this.product.description} (${this.product.brand})`
        );
    } else {
      this.hrefUrl = 'https://wa.me/3364358745?text=' +
        encodeURIComponent(
          'Hola Clara! Estoy interesado en sus productos y me gustaría recibir asesoramiento'
        );
    }
  }
}
