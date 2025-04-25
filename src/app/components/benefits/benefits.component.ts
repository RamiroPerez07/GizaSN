import { Component } from '@angular/core';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [],
  templateUrl: './benefits.component.html',
  styleUrl: './benefits.component.css'
})
export class BenefitsComponent {
  benefits = [
    {
      title: "Envíos Gratuitos",
      description: "San Nicolás de los Arroyos, Villa Constitución, Rosario, San Pedro, Pergamino"
    },
    {
      title: "Atención Personalizada",
      description: "Contamos con vendedores altamente capacitados para responder tus consultas."
    },
    {
      title: "Precio y Calidad",
      description: "Trabajamos productos con altos estándares de calidad a un precio accesible."
    }
  ]
}
