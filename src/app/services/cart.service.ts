import { Injectable } from '@angular/core';
import { BehaviorSubject, map, scan, shareReplay, startWith, Subject } from 'rxjs';
import { IProduct } from '../interfaces/products.interface';

interface CartAction {
  type: 'add' | 'decrease' | 'remove' | 'clear';
  payload?: IProduct;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // ---- Streams de acciones del carrito
  private actions$ = new Subject<CartAction>();

  // ---- Estado del carrito (lista de productos)
  readonly productsInCart$ = this.actions$.pipe(
    startWith<CartAction>({ type: 'clear' }),
    scan((products, action) => this.reduce(products, action), [] as IProduct[]),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  hasCashDiscount$ = this.productsInCart$.pipe(
    map(products => products.some(p => !!p.cashDiscount))
  );

  // ---- Subtotal derivado
  readonly subtotal$ = this.productsInCart$.pipe(
    map(products => this.calculateSubtotal(products)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // ---- Subtotal derivado
  readonly subtotalWithCashDiscount$ = this.productsInCart$.pipe(
    map(products => this.calculateSubtotalCash(products)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // ---- Estado modal checkout
  private modalSubject = new BehaviorSubject<boolean>(false);
  readonly showCustomerCheckoutModal$ = this.modalSubject.asObservable();

  constructor() {}

  // ---- API pública (acciones)
  addProductToCart(product: IProduct) {
    this.actions$.next({ type: 'add', payload: product });
  }

  decreaseProductFromCart(product: IProduct) {
    this.actions$.next({ type: 'decrease', payload: product });
  }

  removeItemFromCart(product: IProduct) {
    this.actions$.next({ type: 'remove', payload: product });
  }

  clearCart() {
    this.actions$.next({ type: 'clear' });
  }

  openCustomerCheckoutModal() {
    this.modalSubject.next(true);
  }

  closeCustomerCheckoutModal() {
    this.modalSubject.next(false);
  }

  // ---- Lógica de mensaje de pedido
  generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.floor(Math.random() * 1000).toString(36);
    return `${timestamp}${random}`;
  }

  generateOrderMessage(
    puntoDeVenta: string,
    nombre: string,
    apellido: string,
    formaPago: string,
    documento: string,
    direccionFinal: string,
    localidadFinal: string,
    telefono: string,
    products: IProduct[],
    subtotal: number,
    subtotalConDescEfectivo: number,
    tieneDescuentoEfectivo: boolean,
  ) {
    let mensaje = `Hola! 👋\n\nTe hago un nuevo pedido:\n\n`;
    mensaje += `Punto de venta: *${puntoDeVenta}*\n\n`;

    products.forEach(p => {
      const unitPrice = p.price * (1 - (p.discount ?? 0) / 100);
      const roundedPrice = Math.ceil(unitPrice / 100) * 100; // redondea a múltiplos de 100 hacia arriba

      mensaje += `- ${p.description}\nMarca: ${p.brand}\nCantidad: ${p.quantity}\nPrecio Unitario: $${roundedPrice}`;

      if (p.discount && p.discount > 0) {
        mensaje += ` (descuento ${p.discount}%)`;
      }

      if (p.cashDiscount && formaPago == "Efectivo") {
        mensaje += ` (Desc. Efvo ${p.cashDiscount}%)`;
      }

      mensaje += `\n\n`;
    });

    if (tieneDescuentoEfectivo && formaPago == "Efectivo"){
      mensaje += `🧾 Total *$${subtotalConDescEfectivo}*\n\n`;
    }
    else {
      mensaje += `🧾 Total *$${subtotal}*\n\n`;
    }
    mensaje += `ID del pedido: *${this.generateOrderId()}*\n`;
    mensaje += `Comprador: *${nombre.trim()} ${apellido.trim()}*\nForma de pago: *${formaPago}*\n`;

    if (documento) mensaje += `Documento: *${documento}*\n`;

    mensaje += `Dirección de entrega: *${direccionFinal.trim()}* (${localidadFinal})\nGracias!\nSaludos.`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  // ---- Reducer
  private reduce(products: IProduct[], action: CartAction): IProduct[] {
    switch (action.type) {
      case 'add': {
        const product = action.payload!;
        const existing = products.find(p => p.id === product.id);
        if (existing) {
          return products.map(p =>
            p.id === product.id ? { ...p, quantity: (p.quantity ?? 0) + 1 } : p
          );
        }
        return [...products, { ...product, quantity: 1 }];
      }
      case 'decrease': {
        const product = action.payload!;
        const existing = products.find(p => p.id === product.id);
        if (!existing) return products;
        if ((existing.quantity ?? 0) > 1) {
          return products.map(p =>
            p.id === product.id ? { ...p, quantity: (p.quantity ?? 0) - 1 } : p
          );
        }
        return products.filter(p => p.id !== product.id);
      }
      case 'remove': {
        const product = action.payload!;
        return products.filter(p => p.id !== product.id);
      }
      case 'clear':
        return [];
      default:
        return products;
    }
  }

  // ---- Subtotal cálculo
  private calculateSubtotal(products: IProduct[]): number {
    return products.reduce((acc, p) => {
      const q = p.quantity ?? 0;
      const unitPrice = p.price * (1 - (p.discount ?? 0) / 100);
      const roundedUnitPrice = Math.ceil(unitPrice / 100) * 100;
      return acc + roundedUnitPrice * q;
    }, 0);
  }

  // ---- Subtotal cálculo
  private calculateSubtotalCash(products: IProduct[]): number {
    return products.reduce((acc, p) => {
      const q = p.quantity ?? 0;
      const unitPrice = p.price * (1 - (p.discount ?? 0) / 100) * (1 - (p.cashDiscount ?? 0) / 100);
      const roundedUnitPrice = Math.ceil(unitPrice / 100) * 100;
      return acc + roundedUnitPrice * q;
    }, 0);
  }
}