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

  constructor() { 
    this.allowedCategoryIds.subscribe({
      next: () => {
        this.updateVisibleCategories();
        this.getAllProducts();
      }
    })

  }

  private readonly _dbProducts = products;

  private readonly _dbCategories = categories;

  categories = new BehaviorSubject<ICategory[]>([])

  products = new BehaviorSubject<IProduct[]>([]);

  $products = this.products.asObservable();

  $categories = this.categories.asObservable();

  allowedCategoryIds = new BehaviorSubject<string[]>([]);

  $allowedCategoryIds = this.allowedCategoryIds.asObservable();

  setAllowedCategories(categoryIds: string[]) {
    this.allowedCategoryIds.next(categoryIds);
  }

  private isAllowed(product: IProduct): boolean {
    if (product.visible === false) return false;
    if (this.allowedCategoryIds.value.length === 0) return true;
    //El producto tiene que tener todas las categorias permitidas por el pos
    return product.idCategories.every(catId => this.allowedCategoryIds.value.includes(catId));
  }

  getAllProducts(){
    const visibleProducts = this._dbProducts.filter((product: IProduct) => this.isAllowed(product))
    this.products.next(visibleProducts);
  }

  updateVisibleCategories() {
    const visibleCats = this._dbCategories.filter(c => this.isAllowedCategory(c));
    this.categories.next(visibleCats);
  }

  getProductsForHeroCarousel() {
  const heroProducts = this._dbProducts
    .filter((product: IProduct) => 
      this.isAllowed(product) && product.showInHeroCarousel === true
    )
    .sort((a, b) => b.priority - a.priority); // orden descendente por prioridad

  this.products.next(heroProducts);
}

  filterProductsByCategory(categoryId: string) {
    const filtered = this._dbProducts.filter(product =>
      this.isAllowed(product) &&
      product.idCategories.includes(categoryId)
    );

    this.products.next(filtered);
  }

  getProductById(id: number): IProduct | undefined{
    return this._dbProducts.find(p => p.id === id);
  }

  getProductsByIds(productsIds: number[]): IProduct[] {
    return this._dbProducts.filter(p => productsIds.includes(p.id) && this.isAllowed(p) );
  }

  findCategoryById(id: string): ICategory | undefined {
    return this._dbCategories.find(cat => cat.id === id);
  }

  private isAllowedCategory(cat: ICategory): boolean {
    if (!cat.visible) return false;
    if (this.allowedCategoryIds.value.length === 0) return false;
    return this.allowedCategoryIds.value.includes(cat.id);
  }

  getCategoriesByParent(parentId: string | null): ICategory[] {
    return this.categories.value.filter(cat => (cat.parentId === parentId) && this.isAllowedCategory(cat))
    //antes this._dbCategories
  }

  getCategoryPath(categoryId: string): ICategory[] {
    const path: ICategory[] = [];
    let currentCategory = this.findCategoryById(categoryId);

    while (currentCategory) {
      if (this.isAllowedCategory(currentCategory)) {
        path.unshift(currentCategory); // Agrego al inicio para que quede raíz -> hijo
      }
      if (!currentCategory.parentId) break;
      currentCategory = this.findCategoryById(currentCategory.parentId);
    }

    return path;
  }

  filterProductsBySearch(searchTerm: string) {
    const terms = searchTerm.toLowerCase().trim().split(/\s+/); // separa por espacios

    const filtered = this._dbProducts.filter(product => {
      if (!this.isAllowed(product)) return false;

      return terms.some(term => {
        const inDescription = product.description.toLowerCase().includes(term);
        const inBrand = product.brand.toLowerCase().includes(term);
        const inCategories = product.idCategories.some(cat => cat.toLowerCase().includes(term));
        const inTags = product.tags.some(tag => tag.toLowerCase().includes(term));
        return inDescription || inBrand || inCategories || inTags;
      });
    });

    this.products.next(filtered);
  }

}
