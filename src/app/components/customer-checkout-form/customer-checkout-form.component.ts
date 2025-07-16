import { Component, inject, Input, OnInit } from '@angular/core';
import { PointOfSale } from '../../interfaces/pointofsale.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { PointOfSaleService } from '../../services/point-of-sale.service';

@Component({
  selector: 'app-customer-checkout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-checkout-form.component.html',
  styleUrl: './customer-checkout-form.component.css'
})
export class CustomerCheckoutFormComponent implements OnInit {
  @Input() showModal: boolean = false;

  pos!: PointOfSale | null;

  gizaPos!: PointOfSale | undefined;

  subtotal!: number;

  readonly fb = inject(FormBuilder);

  readonly pointOfSaleSvc = inject(PointOfSaleService);

  readonly cartSvc = inject(CartService);

  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    documento: [''],
    formaPago: ['Efectivo', Validators.required],
    tipoDireccion: ['estandar', Validators.required],
    direccion: [''],
    localidad: ["San Nicolás de los Arroyos"]
  });

  showCustomerCheckoutModal!: boolean;

  ngOnInit(): void {

    this.pos = this.pointOfSaleSvc.getCurrentPointOfSale();
    this.gizaPos = this.pointOfSaleSvc.getPointOfSaleById("giza");

    this.cartSvc.$showCustomerCheckoutModal.subscribe({
      next: (showCustomerCheckoutModal: boolean) => {
        this.showCustomerCheckoutModal = showCustomerCheckoutModal
      }
    })

    // Observa y cambia validadores dinámicamente
    this.form.get('tipoDireccion')?.valueChanges.subscribe((value) => {
      const direccionControl = this.form.get('direccion');
      const localidadControl = this.form.get('localidad');
      if (value === 'personalizada') {
        direccionControl?.setValidators([Validators.required]);
        localidadControl?.setValidators([Validators.required]);
      } else {
        direccionControl?.clearValidators();
        localidadControl?.clearValidators();
      }
      direccionControl?.updateValueAndValidity();
      localidadControl?.updateValueAndValidity();
    });

    // Observa y cambia validadores dinámicamente
    this.form.get('formaPago')?.valueChanges.subscribe((value) => {
      const direccionControl = this.form.get('documento');
      if (value !== 'Efectivo') {
        direccionControl?.setValidators([Validators.required]);
      } else {
        direccionControl?.clearValidators();
      }
      direccionControl?.updateValueAndValidity();
    });
  }

  closeModal() {
    this.cartSvc.closeCustomerCheckoutModal()
  }

  onSubmitForm(){

    if (this.form.invalid) {
      this.form.markAllAsTouched(); 
      return;
    }

    const { nombre, apellido, documento, formaPago , direccion, tipoDireccion, localidad  } = this.form.value;

    const pos = this.pointOfSaleSvc.getCurrentPointOfSale();

    if (!pos) {
      console.warn('No se encontró un punto de venta válido');
      return;
    }

    const telefono = pos.telefono;

    const puntoDeVenta = pos.puntoDeVenta;

    let direccionFinal = '';
    let localidadFinal = '';

    if (tipoDireccion === 'estandar') {
      direccionFinal = pos?.direccion ?? '';
      localidadFinal = pos?.localidad ?? ''
    } else if (tipoDireccion === 'giza') {
      direccionFinal = this.pointOfSaleSvc.getPointOfSaleById("giza")?.direccion ?? '';
      localidadFinal = this.pointOfSaleSvc.getPointOfSaleById("giza")?.localidad ?? '';
    } else if (tipoDireccion === 'personalizada') {
      direccionFinal = direccion;
      localidadFinal = localidad;
    }

    this.cartSvc.generateOrderMessage(puntoDeVenta, nombre,apellido,formaPago,documento,direccionFinal,localidadFinal,telefono)

    this.closeModal(); //cierro el formulario
    this.form.reset();  //reinicio el formulario
  }
}
