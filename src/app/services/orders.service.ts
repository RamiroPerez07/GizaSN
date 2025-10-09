import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, scan, shareReplay, startWith, Subject, switchMap, tap } from 'rxjs';
import { IProduct } from '../interfaces/products.interface';
import { HttpClient } from '@angular/common/http';
import { IOrder } from '../interfaces/orders.interface';

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

  private readonly _http = inject(HttpClient);

  private filterSubject = new BehaviorSubject<string>('Pendiente');

  filter$ = this.filterSubject.asObservable();

  /** 🔹 Disparador de refresco (cuando se crea o elimina una orden, etc.) */
  private refreshTrigger$ = new Subject<void>();

  /** 🔹 Stream principal de órdenes (reactivo y autoactualizable) */
  readonly orders$: Observable<IOrder[]> = combineLatest([
    this.filter$,
    this.refreshTrigger$.pipe(startWith(void 0)) // Emite una vez inicial y luego cada vez que disparamos un refresh
  ]).pipe(
    switchMap(([status]) => this.getOrdersByStatus(status)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Método para cambiar el filtro
  setFilter(status: string): void {
    this.filterSubject.next(status);
  }


  getOrdersByStatus(status: string) : Observable<IOrder[]> {
    return this._http.get<IOrder[]>(
      "https://giza-sn-backend.vercel.app/api/orders/status/"+status
    )
  }

  getOrderById(id: string) : Observable<IOrder> {
    return this._http.get<IOrder>(
      "https://giza-sn-backend.vercel.app/api/orders/"+id
    )
  }

  createOrder(order: IOrder): Observable<IOrder> {
    return this._http.post<IOrder>(
      "https://giza-sn-backend.vercel.app/api/orders", order
    ).pipe(
      tap(() => this.refreshOrders()) // se ejecuta solo cuando el POST finaliza correctamente
    );
  }

  updateOrderObservations(orderId: string, observation: string): Observable<IOrder> {
    return this._http
      .patch<IOrder>(`https://giza-sn-backend.vercel.app/api/orders/${orderId}`, { observation })
      .pipe(tap(() => this.refreshOrders()));
  }

  /** API para refrescar manualmente las órdenes */
  refreshOrders(): void {
    this.refreshTrigger$.next();
  }

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

  calculateOrderSubtotal(order: IOrder){
    return order.items.reduce((acum, order) => {
      return acum + order.price * (order.quantity ?? 0)
    }, 0)
  }

  generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.floor(Math.random() * 1000).toString(36);
    return `${timestamp}${random}`;
  }

  /** Actualiza flags delivered/charged y resuelve automáticamente el status */
  updateOrderStatusFlags(order: IOrder, changes: Partial<Pick<IOrder, 'delivered' | 'charged'>>): Observable<IOrder> {
    const delivered = changes.delivered ?? order.delivered;
    const charged = changes.charged ?? order.charged;

    let status = 'Pendiente';
    if (delivered && charged) status = 'Entregado y cobrado';
    else if (delivered) status = 'Pendiente de cobro';
    else if (charged) status = 'Pendiente de entrega';

    // Asignar deliveryDate según delivered
    let deliveryDate: Date | undefined;
    if (delivered) {
      deliveryDate = order.deliveryDate ?? new Date(); // si ya tenía, no lo sobreescribimos
    } else {
      deliveryDate = undefined; // explícitamente undefined si no está entregado
    }

    const payload: Partial<IOrder> = {
      ...changes,
      status,
      deliveryDate
    };

    return this._http.patch<IOrder>(`https://giza-sn-backend.vercel.app/api/orders/${order._id}`, payload)
      .pipe(tap(() => this.refreshOrders()));
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
