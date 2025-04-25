import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IProduct } from '../interfaces/products.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  productsInCart = new BehaviorSubject<IProduct[]>([])

  $productsInCart = this.productsInCart.asObservable()

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

  constructor() { }
}
