import { Component, inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { PointOfSale } from '../../interfaces/pointofsale.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { PointOfSaleService } from '../../services/point-of-sale.service';
import { ToastrService } from 'ngx-toastr';
import { businessAlias } from '../../utils/constants';
import { IProduct } from '../../interfaces/products.interface';

@Component({
  selector: 'app-customer-checkout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-checkout-form.component.html',
  styleUrl: './customer-checkout-form.component.css'
})
export class CustomerCheckoutFormComponent implements OnInit {
  readonly fb = inject(FormBuilder);
  readonly pointOfSaleSvc = inject(PointOfSaleService);
  readonly cartSvc = inject(CartService);
  readonly toastSvc = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);

  businessAlias = businessAlias;

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    documento: [''],
    formaPago: ['Efectivo', Validators.required],
    tipoDireccion: ['estandar', Validators.required],
    direccion: [''],
    localidad: ['San Nicolás de los Arroyos']
  });

  // streams
  pos$ = this.pointOfSaleSvc.pos$;
  showModal$ = this.cartSvc.showCustomerCheckoutModal$;
  gizaPos = this.pointOfSaleSvc.getPointOfSaleById('giza');

  ngOnInit() {
    // cambia validadores de formaPago
    this.form.get('formaPago')!.valueChanges.subscribe((value) => {
      const doc = this.form.get('documento')!;
      value !== 'Efectivo' ? doc.setValidators([Validators.required]) : doc.clearValidators();
      doc.updateValueAndValidity();
    });

    // cambia validadores tipoDireccion
    this.form.get('tipoDireccion')!.valueChanges.subscribe((value) => {
      const dir = this.form.get('direccion')!;
      const loc = this.form.get('localidad')!;
      if (value === 'personalizada') {
        dir.setValidators([Validators.required]);
        loc.setValidators([Validators.required]);
      } else {
        dir.clearValidators();
        loc.clearValidators();
      }
      dir.updateValueAndValidity();
      loc.updateValueAndValidity();
    });
  }

  closeModal() {
    this.cartSvc.closeCustomerCheckoutModal();
  }

  onSubmitForm(pos: PointOfSale | null, products: IProduct[], subtotal: number) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, apellido, documento, formaPago, direccion, tipoDireccion, localidad } =
      this.form.value;

    if (!pos) return;

    let direccionFinal = '';
    let localidadFinal = '';

    if (tipoDireccion === 'estandar') {
      direccionFinal = pos.direccion ?? '';
      localidadFinal = pos.localidad ?? '';
    } else if (tipoDireccion === 'giza') {
      direccionFinal = this.gizaPos?.direccion ?? '';
      localidadFinal = this.gizaPos?.localidad ?? '';
    } else {
      direccionFinal = direccion ?? '';
      localidadFinal = localidad ?? '';
    }

    this.cartSvc.generateOrderMessage(
      pos.puntoDeVenta,
      nombre!,
      apellido!,
      formaPago!,
      documento!,
      direccionFinal,
      localidadFinal,
      pos.telefono,
      products,
      subtotal
    );

    this.closeModal();
    this.form.reset();
  }

  copyAlias() {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard.writeText(this.businessAlias).then(() => {
      this.toastSvc.success('Alias copiado al portapapeles', 'Copiado');
    });
  }
}
