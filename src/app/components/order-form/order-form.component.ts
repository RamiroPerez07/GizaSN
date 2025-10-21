import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PointOfSaleService } from '../../services/point-of-sale.service';
import { Subscription } from 'rxjs';
import { OrderProductsComponent } from "../order-products/order-products.component";
import { PointOfSale } from '../../interfaces/pointofsale.interface';
import { IProduct } from '../../interfaces/products.interface';
import { IOrder } from '../../interfaces/orders.interface';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerComponent } from '../spinner/spinner.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrderProductsComponent, SpinnerComponent],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent implements OnInit {

  isLoading: boolean = false;

  readonly fb = inject(FormBuilder);

  readonly orderSvc = inject(OrdersService);

  readonly pointOfSaleSvc = inject(PointOfSaleService);

  readonly cartSvc = inject(CartService);

  readonly toastSvc = inject(ToastrService);

  readonly authSvc = inject(AuthService);

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

    this.isLoading = true; // <- EMPIEZA LOADING

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

    const newOrder : IOrder = {
      nameBuyer: nombre ?? '',
      lastNameBuyer: apellido ?? '',
      delivered: false,
      charged: false,
      origin: "Manual",
      deliveryDate: null,
      address: direccionFinal ?? 'Sin Especificar',
      locality: localidadFinal ?? 'Sin Especificar',
      paymentMethod: formaPago ?? 'Efectivo',
      identityDocument: documento || undefined,
      idOrder: this.cartSvc.generateOrderId(),
      items: products,
      status: "Pendiente",
      posId: this.gizaPos?.id ?? 'giza',
      pos: this.gizaPos?.puntoDeVenta ?? 'Giza',
      username: this.authSvc.getCurrentUser()?.name ?? 'Cliente',
    } 
    
    this.orderSvc.createOrder(newOrder).subscribe({
      next: () => {
        this.toastSvc.success("Pedido cargado exitosamente", "Carga exitosa");
        this.closeModal();
        this.orderSvc.clearOrder();
        this.showErrorInProducts = false;
        this.form.reset();
        this.form.get('tipoDireccion')?.setValue('giza');
        this.form.get('formaPago')?.setValue('Efectivo');
        this.getOrdersByStatus(this.filterStatus);
        this.isLoading = false; // <- TERMINA LOADING (éxito)
      },
      error: (error: HttpErrorResponse) => {
        this.toastSvc.error(error.message, "Error");
        this.isLoading = false; // <- TERMINA LOADING (error)
      }
    })
  }

  getOrdersByStatus(status:string){
      this.orderSvc.getOrdersByStatus(status);
  }

  filterStatus!: string;

  ngOnInit(): void {

    this.orderSvc.filter$.subscribe({
      next: (filter: string) => {
        this.filterStatus = filter;
      }
    })

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
