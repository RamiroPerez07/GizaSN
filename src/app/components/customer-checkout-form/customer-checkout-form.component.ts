import { Component, inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { PointOfSale } from '../../interfaces/pointofsale.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { PointOfSaleService } from '../../services/point-of-sale.service';
import { ToastrService } from 'ngx-toastr';
import { businessAlias } from '../../utils/constants';
import { IProduct } from '../../interfaces/products.interface';
import { map, Subscription, take } from 'rxjs';
import { unsubscribe } from 'node:diagnostics_channel';
import { IOrder } from '../../interfaces/orders.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdersService } from '../../services/orders.service';
import { SpinnerComponent } from "../spinner/spinner.component";

@Component({
  selector: 'app-customer-checkout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './customer-checkout-form.component.html',
  styleUrl: './customer-checkout-form.component.css'
})
export class CustomerCheckoutFormComponent implements OnInit, OnDestroy {
  readonly fb = inject(FormBuilder);
  readonly pointOfSaleSvc = inject(PointOfSaleService);
  readonly cartSvc = inject(CartService);
  readonly toastSvc = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly orderSvc = inject(OrdersService);

  businessAlias = businessAlias;

  isLoading = false; 

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
  subtotal$ = this.cartSvc.subtotal$;
  subtotalWithCashDiscount$ = this.cartSvc.subtotalWithCashDiscount$;
  hasCashDiscount! : boolean;
  hasCashDiscount$ = this.cartSvc.productsInCart$.pipe(
    map(products => products.some(p => !!p.cashDiscount))
  );
  gizaPos = this.pointOfSaleSvc.getPointOfSaleById('giza');

  subPos: Subscription | undefined;

  subHasCashDiscount: Subscription | undefined;

  ngOnDestroy() {
    this.subPos?.unsubscribe();
    this.subHasCashDiscount?.unsubscribe();
  }

  ngOnInit() {

    this.subPos = this.pos$.subscribe(pos => {
      if (pos?.ofreceRetiro) {
        this.form.get('tipoDireccion')?.setValue('estandar');
      } else if (pos && !pos.ofreceRetiro && this.gizaPos) {
        this.form.get('tipoDireccion')?.setValue('giza');
      } else {
        this.form.get('tipoDireccion')?.setValue('personalizada');
      }
    });

    this.subHasCashDiscount = this.cartSvc.productsInCart$.subscribe({
      next: (products) => {
        this.hasCashDiscount = products.some(p => !!p.cashDiscount)
      }
    })

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

  onSubmitForm(pos: PointOfSale | null, products: IProduct[], subtotal: number, subtotalWithCashDiscount: number) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!products.length){
      this.toastSvc.error("No hay productos en el carrito");
      return;
    } 

    this.isLoading = true; 

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

    const orderProducts = products.map((product: IProduct) => {
      return {
        ...product,
        price: this.orderSvc.getFinalPrice(product, formaPago ?? "Efectivo"),
      }
    });

    const idOrder = this.cartSvc.generateOrderId();

    const newOrder : IOrder = {
      nameBuyer: nombre ?? '',
      lastNameBuyer: apellido ?? '',
      delivered: false,
      charged: false,
      origin: "Cliente",
      deliveryDate: null,
      address: direccionFinal ?? 'Sin Especificar',
      locality: localidadFinal ?? 'Sin Especificar',
      paymentMethod: formaPago ?? 'Efectivo',
      identityDocument: documento || undefined,
      idOrder: idOrder,
      items: orderProducts,
      status: "Pendiente",
      posId: pos.id ?? 'giza',
      pos: pos.puntoDeVenta ?? 'Giza'
    } 

    this.orderSvc.createOrder(newOrder).subscribe({
      next: () => {
        this.toastSvc.success("Pedido cargado exitosamente", "Carga exitosa");
      },
      error: (error: HttpErrorResponse) => {
        this.toastSvc.error(error.message, "Error");
      },
      complete: () => {
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
          subtotal,
          subtotalWithCashDiscount,
          this.hasCashDiscount,
          idOrder,
        );

        this.closeModal();
        this.form.reset();
        this.cartSvc.clearCart();
        this.isLoading = false;
      }
    })

    
  }

  copyAlias() {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard.writeText(this.businessAlias).then(() => {
      this.toastSvc.success('Alias copiado al portapapeles', 'Copiado');
    });
  }
}
