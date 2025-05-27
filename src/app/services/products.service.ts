import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { products } from '../data/products';
import { ICategory } from '../interfaces/categories.interface';
import { IProduct } from '../interfaces/products.interface';
import { categories } from '../data/categories';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor() { }

  private readonly _dbProducts = products;

  private readonly _dbCategories = categories;

  categories = new BehaviorSubject<ICategory[]>([])

  products = new BehaviorSubject<IProduct[]>([]);

  $products = this.products.asObservable();

  $categories = this.categories.asObservable();

  getAllProducts(){
    const visibleProducts = this._dbProducts.filter((product: IProduct) => product.visible !== false)
    this.products.next(visibleProducts);
  }

  filterProductsByCategory(categoryId: string){

    const filterProducts: IProduct[] = this._dbProducts.filter((product: IProduct) => product.idCategory === categoryId && product.visible !== false)

    this.products.next(filterProducts)
  }

  getProductById(id: number): IProduct | undefined{
    return this._dbProducts.find(p => p.id === id);
  }



  findCategoryById(id: string, categories = this._dbCategories): ICategory | null {
    for (const category of categories) {
      if (category.id === id) {
        return category;
      }
  
      if (category.children && category.children.length > 0) {
        const found = this.findCategoryById(id, category.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

}
