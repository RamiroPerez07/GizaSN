import { Injectable } from '@angular/core';
import { BehaviorSubject, map, scan, shareReplay, startWith, Subject } from 'rxjs';
import { IProduct } from '../interfaces/products.interface';

interface AddAction {
  type: 'add';
  payload: IProduct;
}

interface DecreaseAction {
  type: 'decrease';
  payload: IProduct;
}

interface RemoveAction {
  type: 'remove';
  payload: IProduct;
}

interface ClearAction {
  type: 'clear';
}

interface UpdateAction {
  type: 'update';
  payload: {
    product: IProduct;
    field: 'quantity' | 'price';
    value: number;
  };
}

type OrderAction = AddAction | DecreaseAction | RemoveAction | ClearAction | UpdateAction;

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  // ---- Streams de acciones del carrito
    private actions$ = new Subject<OrderAction>();

  // ---- Estado del carrito (lista de productos)
  readonly productsInOrder$ = this.actions$.pipe(
    startWith<OrderAction>({ type: 'clear' }),
    scan((products, action) => this.reduce(products, action), [] as IProduct[]),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  hasCashDiscount$ = this.productsInOrder$.pipe(
    map(products => products.some(p => !!p.cashDiscount))
  );

  constructor() { }

  // ---- Estado modal create order
  private modalSubject = new BehaviorSubject<boolean>(false);
  readonly showCreateOrderModal$ = this.modalSubject.asObservable();
  

  openCreateOrderModal() {
    this.modalSubject.next(true);
  }

  closeCreateOrderModal() {
    this.modalSubject.next(false);
  }

  // ---- API pública (acciones)
  addProductToOrder(product: IProduct) {
    this.actions$.next({ type: 'add', payload: product });
  }

  decreaseProductFromOrder(product: IProduct) {
    this.actions$.next({ type: 'decrease', payload: product });
  }

  removeItemFromOrder(product: IProduct) {
    this.actions$.next({ type: 'remove', payload: product });
  }

  updateProduct(product: IProduct, field: 'quantity' | 'price', value: number) {
    this.actions$.next({ 
      type: 'update', 
      payload: { product, field, value } 
    });
  }

  clearOrder() {
    this.actions$.next({ type: 'clear' });
  }

  generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.floor(Math.random() * 1000).toString(36);
    return `${timestamp}${random}`;
  }

  // ---- Reducer
  private reduce(products: IProduct[], action: OrderAction): IProduct[] {
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
      case 'update': {
      const { product, field, value } = action.payload;
      return products.map(p =>
        p.id === product.id
          ? { ...p, [field]: value }
          : p
      )}
      default:
        return products;
    }
  }
}
