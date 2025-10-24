import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
export class OrderFormComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() mode: 'create' | 'edit' = 'create';

  @Input() existingOrder?: IOrder;

  // EventEmitter para avisar al padre que hubo cambios
  @Output() orderUpdated = new EventEmitter<void>();

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

  onSubmitFormEdit(products: IProduct[]){
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (products.length<=0) {
      this.showErrorInProducts = true;
      return
    };

    const { nombre, apellido, documento, formaPago, direccion, tipoDireccion, localidad } =
      this.form.value;

    const editedOrder : IOrder = {
      _id: this.existingOrder?._id,
      nameBuyer: nombre ?? '',
      lastNameBuyer: apellido ?? '',
      delivered: this.existingOrder?.delivered ?? false,
      charged: this.existingOrder?.charged ?? false,
      origin: this.existingOrder?.origin ?? 'Manual',
      deliveryDate: this.existingOrder?.deliveryDate,
      address: direccion ?? 'Sin Especificar',
      locality: localidad ?? 'Sin Especificar',
      paymentMethod: formaPago ?? 'Efectivo',
      identityDocument: documento || undefined,
      idOrder: this.existingOrder?.idOrder ?? '',
      items: products,
      addressType: this.existingOrder?.address === direccion ? (tipoDireccion ?? '') : 'personalizada',
      status: this.existingOrder?.status ?? 'Pendiente',
      posId: this.existingOrder?.posId ?? 'giza',
      pos: this.existingOrder?.pos ?? 'Giza',
      username: this.existingOrder?.username ?? 'Cliente',
      observation: this.existingOrder?.observation ?? '',
      telBuyer: this.existingOrder?.telBuyer ?? undefined,
    }

    this.orderSvc.updateOrder(editedOrder).subscribe({
      next: () => {
        this.toastSvc.success("Pedido editado exitosamente", "Edición exitosa");
        this.closeModal();
        this.orderSvc.clearOrder();
        this.showErrorInProducts = false;
        this.form.reset();
        this.form.get('tipoDireccion')?.setValue('giza');
        this.form.get('formaPago')?.setValue('Efectivo');
        this.getOrdersByStatus(this.filterStatus);
        this.isLoading = false; // <- TERMINA LOADING (éxito)
        this.orderUpdated.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.toastSvc.error(error.message, "Error");
        this.isLoading = false; // <- TERMINA LOADING (error)
      }
    })

  }

  onSubmitForm(pos: PointOfSale | null, products: IProduct[]){
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!pos) return;

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
      addressType: tipoDireccion ?? 'estandar',
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

  ngAfterViewInit() {
    if (this.mode === 'edit' && this.existingOrder && this.existingOrder.items?.length > 0) {
      this.orderSvc.initializeProductsInOrder(this.existingOrder.items);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingOrder'] && this.mode === 'edit' && this.existingOrder) {
      this.form.patchValue({
        nombre: this.existingOrder.nameBuyer,
        apellido: this.existingOrder.lastNameBuyer,
        documento: this.existingOrder.identityDocument ?? '',
        formaPago: this.existingOrder.paymentMethod,
        tipoDireccion: this.existingOrder.addressType ?? 'estandar',
        direccion: this.existingOrder.address,
        localidad: this.existingOrder.locality,
      });

      // ⚙️ Reaplicar validadores dinámicos según el valor actual
      const formaPago = this.form.get('formaPago')!.value;
      const tipoDireccion = this.form.get('tipoDireccion')!.value;

      const doc = this.form.get('documento')!;
      const dir = this.form.get('direccion')!;
      const loc = this.form.get('localidad')!;

      // --- Validadores de formaPago ---
      if (formaPago === 'Transferencia') {
        doc.setValidators([Validators.required]);
      } else {
        doc.clearValidators();
      }
      doc.updateValueAndValidity({ emitEvent: false });

      // --- Validadores de tipoDireccion ---
      if (tipoDireccion === 'personalizada') {
        dir.setValidators([Validators.required]);
        loc.setValidators([Validators.required]);
      } else {
        dir.clearValidators();
        loc.clearValidators();
      }
      dir.updateValueAndValidity({ emitEvent: false });
      loc.updateValueAndValidity({ emitEvent: false });

      // 🔁 Inicializar productos si existen
      if (this.existingOrder.items?.length > 0) {
        this.orderSvc.initializeProductsInOrder(this.existingOrder.items);
      }
    }
  }

  ngOnInit(): void {

    this.orderSvc.clearOrder();

    if (this.mode === 'edit' && this.existingOrder) {
      this.form.patchValue({
        nombre: this.existingOrder.nameBuyer,
        apellido: this.existingOrder.lastNameBuyer,
        documento: this.existingOrder.identityDocument ?? '',
        formaPago: this.existingOrder.paymentMethod,
        tipoDireccion: this.existingOrder.addressType ?? 'estandar',
        direccion: this.existingOrder.address,
        localidad: this.existingOrder.locality
      });
    };

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
      value == 'Transferencia' ? doc.setValidators([Validators.required]) : doc.clearValidators();
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
