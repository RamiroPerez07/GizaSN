import { Component, inject, OnInit } from '@angular/core';
import { IProduct } from '../../interfaces/products.interface';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PointOfSaleService } from '../../services/point-of-sale.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PointOfSale } from '../../interfaces/pointofsale.interface';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  productsInCart !: IProduct[];

  readonly cartSvc = inject(CartService);

  readonly routerSvc = inject(Router);

  subtotal!: number;

  pos!: PointOfSale | null;

  gizaPos!: PointOfSale | undefined;

  ngOnInit(): void {
    this.cartSvc.$productsInCart.subscribe({
      next: (productsInCart: IProduct[]) => {
        this.productsInCart = productsInCart
        if(productsInCart.length <= 0){
          this.routerSvc.navigate(['products'])
          return
        }
        this.subtotal = this.productsInCart.reduce((acc: number, p: IProduct) => acc + (p.price * (p.quantity ?? 0) * (1 - (p.discount1 ?? 0) / 100) * (1 - (p.discount2 ?? 0) / 100) * (1 - (p.discount3 ?? 0) / 100)), 0);
      }
    })

    this.pos = this.pointOfSaleSvc.getCurrentPointOfSale();
    this.gizaPos = this.pointOfSaleSvc.getPointOfSaleById("giza");

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

  addProductToCart(product: IProduct){
    this.cartSvc.addProductToCart(product);
  }

  decreaseProductFromCart(product: IProduct){
    this.cartSvc.decreaseProductFromCart(product);
  }

  removeItemFromCart(product: IProduct){
    this.cartSvc.removeItemFromCart(product);
  }

  cleanCart(){
    this.productsInCart.forEach((product) => this.cartSvc.removeItemFromCart(product) )
    this.routerSvc.navigate(['products'])
  }

  generateOrderId(){
    const timestamp = Date.now().toString(36); // ~8 caracteres
    const random = Math.floor(Math.random() * 1000).toString(36); // ~2 caracteres
    return `${timestamp}${random}`; // total: 8–10 caracteres alfanuméricos
  }

  readonly pointOfSaleSvc = inject(PointOfSaleService);

  openForm(){
    this.showModal = true;
  }

  onSubmitForm(){

    if (this.form.invalid) {
      this.form.markAllAsTouched(); 
      return;
    }

    const { nombre, apellido, documento, formaPago, horarioDeEntrega , direccion, tipoDireccion, localidad  } = this.form.value;

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


    let mensaje = `Hola! 👋\n\n`;
    mensaje += `Te hago un nuevo pedido:\n\n`;

    mensaje += `Punto de venta: *${puntoDeVenta}*\n\n`;

    this.productsInCart.forEach((product, index) => {

      mensaje += `${index + 1}. ${product.description}\n`;
      mensaje += `Marca: ${product.brand}\n`;
      mensaje += `Cantidad: ${product.quantity}\n`;
      mensaje += `Precio Unitario: $${product.price}\n\n`;
    });

    mensaje += `🧾 Total *$${this.subtotal}*\n\n`;

    mensaje += `ID del pedido: *${this.generateOrderId()}*\n`;
    mensaje += `Comprador: *${nombre} ${apellido}*\n`;
    mensaje += `Forma de pago: *${formaPago}*\n`;
    if(documento && documento != ""){
      mensaje += `Documento: *${documento}*\n`;
    }
    mensaje += `Dirección de entrega: *${direccionFinal}* (${localidadFinal})\n`;
    mensaje += `Horario de entrega: *${horarioDeEntrega}*\n\n`;

    mensaje += `Gracias!\nSaludos.`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
    window.open(url, '_blank');

    this.showModal = false;
    this.form.reset();
  }

  viewProductDetail(id: number){
    this.routerSvc.navigate(["products", id]);
  }

  showModal = false;

  readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      documento: [''],
      formaPago: ['Efectivo', Validators.required],
      tipoDireccion: ['estandar', Validators.required],
      horarioDeEntrega: ['', Validators.required],
      direccion: [''],
      localidad: ["San Nicolás de los Arroyos"]
  });

  closeModal() {
    this.showModal = false;
  }

}
