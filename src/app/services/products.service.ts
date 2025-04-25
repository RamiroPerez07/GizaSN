import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { products } from '../data/products';
import { ICategory } from '../interfaces/categories.interface';
import { IProduct } from '../interfaces/products.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor() { }

  private readonly _dbProducts = products;

  products = new BehaviorSubject<IProduct[]>([]);

  $products = this.products.asObservable();

  filterProductsByCategory(category: ICategory){

    const filterProducts: IProduct[] = this._dbProducts.filter((product: IProduct) => product.idCategory === category.id)

    this.products.next(filterProducts)
  }

}
