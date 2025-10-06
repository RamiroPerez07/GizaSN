import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PointOfSaleService } from '../../services/point-of-sale.service';
import { Subscription } from 'rxjs';
import { OrderProductsComponent } from "../order-products/order-products.component";
import { PointOfSale } from '../../interfaces/pointofsale.interface';
import { IProduct } from '../../interfaces/products.interface';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrderProductsComponent],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent implements OnInit {

  readonly fb = inject(FormBuilder);

  readonly orderSvc = inject(OrdersService);

  readonly pointOfSaleSvc = inject(PointOfSaleService);

  productsInOrder$ = this.orderSvc.productsInOrder$;

  showModal$ = this.orderSvc.showCreateOrderModal$;
  pos$ = this.pointOfSaleSvc.pos$;

  subPos: Subscription | undefined;

  gizaPos = this.pointOfSaleSvc.getPointOfSaleById('giza');

  ngOnDestroy() {
    this.subPos?.unsubscribe();
  }

  showErrorInProducts: boolean = false;

  onSubmitForm(pos: PointOfSale | null, products: IProduct[]){
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!pos || (this.gizaPos && pos.id != this.gizaPos.id)) return;

    if (products.length<=0) {
      this.showErrorInProducts = true;
      return
    };

    const { nombre, apellido, documento, formaPago, direccion, tipoDireccion, localidad } =
      this.form.value;

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

    this.closeModal();
    this.orderSvc.clearOrder();
    this.showErrorInProducts = false;
    this.form.reset();
    this.form.get('tipoDireccion')?.setValue('giza');
    this.form.get('formaPago')?.setValue('Efectivo');
  }

  ngOnInit(): void {
    this.subPos = this.pos$.subscribe(pos => {
      if (pos?.ofreceRetiro) {
        this.form.get('tipoDireccion')?.setValue('estandar');
      } else if (pos && !pos.ofreceRetiro && this.gizaPos) {
        this.form.get('tipoDireccion')?.setValue('giza');
      } else {
        this.form.get('tipoDireccion')?.setValue('personalizada');
      }
    });

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

  form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      documento: [''],
      formaPago: ['Efectivo', Validators.required],
      tipoDireccion: ['estandar', Validators.required],
      direccion: [''],
      localidad: ['San Nicolás de los Arroyos']
  });

  closeModal(){
    this.orderSvc.closeCreateOrderModal();
  }

  @ViewChild('orderProducts', { read: ElementRef }) orderProducts!: ElementRef;
  @ViewChild('modalContent') modalContent!: ElementRef;

  scrollToProducts() {
    setTimeout(() => {
      this.orderProducts.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

}
