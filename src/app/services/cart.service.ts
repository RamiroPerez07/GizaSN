import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IProduct } from '../interfaces/products.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  productsInCart = new BehaviorSubject<IProduct[]>([])

  $productsInCart = this.productsInCart.asObservable();

  showCustomerCheckoutModal = new BehaviorSubject<boolean>(false)

  $showCustomerCheckoutModal = this.showCustomerCheckoutModal.asObservable();

  addProductToCart(product: IProduct){
    let productsInCart : IProduct[] = this.productsInCart.value;

    const productInCart = productsInCart.find(p => p.id === product.id)

    if(productInCart && productInCart.quantity){
      productInCart.quantity = productInCart.quantity + 1
    }else{
      productsInCart = [...productsInCart, {...product, quantity: 1}]
    }

    this.productsInCart.next(productsInCart)
  }

  decreaseProductFromCart(product: IProduct){
    let productsInCart: IProduct[] = this.productsInCart.value;

    const productInCart = productsInCart.find(p => p.id === product.id)

    if(productInCart && productInCart.quantity && productInCart.quantity>1){
      productInCart.quantity = productInCart.quantity - 1
    }else{
      productsInCart = productsInCart.filter(p => p.id !== product.id)
    }

    this.productsInCart.next(productsInCart)
  }

  removeItemFromCart(product: IProduct){
    let productsInCart: IProduct[] = this.productsInCart.value;

    productsInCart = productsInCart.filter(p => p.id !== product.id)

    this.productsInCart.next(productsInCart)
  }

  getSubtotal(){
    return this.productsInCart.value.reduce((acc: number, p: IProduct) => acc + (p.price * (p.quantity ?? 0) * (1 - (p.discount1 ?? 0) / 100) * (1 - (p.discount2 ?? 0) / 100) * (1 - (p.discount3 ?? 0) / 100)), 0);
  }

  generateOrderId(){
    const timestamp = Date.now().toString(36); // ~8 caracteres
    const random = Math.floor(Math.random() * 1000).toString(36); // ~2 caracteres
    return `${timestamp}${random}`; // total: 8–10 caracteres alfanuméricos
  }

  generateOrderMessage(puntoDeVenta: string, nombre: string, apellido: string, formaPago: string, documento: string, direccionFinal: string, localidadFinal: string, telefono: string){
    let mensaje = `Hola! 👋\n\n`;
    mensaje += `Te hago un nuevo pedido:\n\n`;

    mensaje += `Punto de venta: *${puntoDeVenta}*\n\n`;

    this.productsInCart.value.forEach((product, index) => {

      mensaje += `- ${product.description}\n`;
      mensaje += `Marca: ${product.brand}\n`;
      mensaje += `Cantidad: ${product.quantity}\n`;
      mensaje += `Precio Unitario: $${product.price}\n\n`;
    });

    mensaje += `🧾 Total *$${this.getSubtotal()}*\n\n`;

    mensaje += `ID del pedido: *${this.generateOrderId()}*\n`;
    mensaje += `Comprador: *${nombre} ${apellido}*\n`;
    mensaje += `Forma de pago: *${formaPago}*\n`;

    if(documento && documento != ""){
      mensaje += `Documento: *${documento}*\n`;
    }

    mensaje += `Dirección de entrega: *${direccionFinal}* (${localidadFinal})\n`;

    mensaje += `Gracias!\nSaludos.`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
    window.open(url, '_blank');
  }

  openCustomerCheckoutModal(){
    this.showCustomerCheckoutModal.next(true);
  }

  closeCustomerCheckoutModal(){
    this.showCustomerCheckoutModal.next(false);
  }


}
