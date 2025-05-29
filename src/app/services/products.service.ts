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

  filterProductsByCategory(categoryId: string) {
    const filterProducts = this._dbProducts.filter(product =>
      product.visible === true &&
      product.idCategories.includes(categoryId)
    );

    this.products.next(filterProducts);
  }

  getProductById(id: number): IProduct | undefined{
    return this._dbProducts.find(p => p.id === id);
  }

  findCategoryById(id: string): ICategory | undefined {
    return categories.find(cat => cat.id === id);
  }

  getCategoryPath(categoryId: string): ICategory[] {
    const path: ICategory[] = [];
    let currentCategory = this.findCategoryById(categoryId);

    while (currentCategory) {
      path.unshift(currentCategory); // Agrego al inicio para que quede raíz -> hijo
      if (!currentCategory.parentId) break;
      currentCategory = this.findCategoryById(currentCategory.parentId);
    }

    return path;
  }

}
