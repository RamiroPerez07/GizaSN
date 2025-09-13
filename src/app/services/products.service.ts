import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, Observable, of } from 'rxjs';
import { products } from '../data/products';
import { ICategory } from '../interfaces/categories.interface';
import { IProduct } from '../interfaces/products.interface';
import { categories } from '../data/categories';
import { PointOfSaleService } from './point-of-sale.service';
import { PointOfSale } from '../interfaces/pointofsale.interface';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private allowedCategoryIdsSubject = new BehaviorSubject<string[]>([]);
  private searchTermSubject = new BehaviorSubject<string>('');
  private selectedCategoryIdSubject = new BehaviorSubject<string | null>(null);

  readonly allowedCategoryIds$ = this.allowedCategoryIdsSubject.asObservable();
  readonly searchTerm$ = this.searchTermSubject.asObservable();
  readonly selectedCategoryId$ = this.selectedCategoryIdSubject.asObservable();

  readonly posSvc = inject(PointOfSaleService);

  constructor() {}

  readonly categories$: Observable<ICategory[]> = this.allowedCategoryIds$.pipe(
    filter(ids => ids.length > 0), // <-- evita emitir hasta tener algo
    map(ids => categories.filter(c => isAllowedCategory(c, ids)))
  );

  readonly products$: Observable<IProduct[]> = combineLatest([
    this.allowedCategoryIds$,
    this.searchTerm$,
    this.selectedCategoryId$,
    this.posSvc.pos$,
  ]).pipe(
    map(([allowedIds, searchTerm, selectedCat, pos]) =>
      products.filter(p => {
        if (!isAllowedProduct(p, allowedIds)) return false;
        if (selectedCat && !p.idCategories.includes(selectedCat)) return false;
        return matchesSearch(p, searchTerm);
      })
      .map(p => {
          let prod = applyPosDiscount(p, pos);
          prod = applyPosCashDiscount(prod, pos);
          return prod;
        })
      .sort((a, b) => b.priority - a.priority)
    )
  );

  readonly heroProducts$: Observable<IProduct[]> = combineLatest([
    this.allowedCategoryIds$,
    this.posSvc.pos$
  ]).pipe(
    map(([allowedIds, pos]) =>
      products
        .filter(p => isAllowedProduct(p, allowedIds) && p.showInHeroCarousel)
        .map(p => {
          let prod = applyPosDiscount(p, pos);
          prod = applyPosCashDiscount(prod, pos);
          return prod;
        })
        .sort((a, b) => b.priority - a.priority)
    )
  );

  // Entradas reactivas
  setAllowedCategories(ids: string[]) {
    this.allowedCategoryIdsSubject.next(ids);
  }

  setSearch(term: string) {
    this.searchTermSubject.next(term);
  }

  filterByCategory(categoryId: string | null) {
    this.selectedCategoryIdSubject.next(categoryId);
  }

  getProductById(id: number): Observable<IProduct | undefined> {
    return this.products$.pipe(
      map(products => products.find(p => p.id === id))
    );
  }

  getProductsByIds(ids: number[]): Observable<IProduct[]> {
    return this.products$.pipe(
      map(products => products.filter(p => ids.includes(p.id)))
    );
  }

  getCategoryPath(categoryId: string): Observable<ICategory[]> {
    return this.categories$.pipe(
      map(categories => {
        const path: ICategory[] = [];
        let current = categories.find(c => c.id === categoryId);
        while (current) {
          path.unshift(current);
          if (!current.parentId) break;
          current = categories.find(c => c.id === current!.parentId);
        }
        return path;
      })
    );
  }

  getCategoriesByParentSync(categories: ICategory[], parentId: string | null): ICategory[] {
    return categories.filter(c => c.parentId === parentId);
  }

  getCategoriesByParent(parentId: string | null): Observable<ICategory[]> {
    return this.categories$.pipe(
      map(cats => cats.filter(c => c.parentId === parentId))
    );
  }
}

/** FUNCIONES PURAS */
function isAllowedProduct(product: IProduct, allowedIds: string[]): boolean {
  return product.visible && allowedIds.length > 0 &&
         product.idCategories.every(id => allowedIds.includes(id));
}

function isAllowedCategory(cat: ICategory, allowedIds: string[]): boolean {
  return cat.visible && allowedIds.includes(cat.id);
}

function matchesSearch(product: IProduct, searchTerm: string): boolean {
  const terms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  return terms.some(term =>
    product.description.toLowerCase().includes(term) ||
    product.brand.toLowerCase().includes(term) ||
    product.tags.some(tag => tag.toLowerCase().includes(term)) ||
    product.idCategories.some(cat => cat.toLowerCase().includes(term))
  );
}

/** FUNCIÓN PURA */
function applyPosDiscount(p: IProduct, pos?: PointOfSale | null): IProduct {
  if (!pos?.descuento) return { ...p, discount: null };

  const appliesByCategory = pos.descuento.categoryIds?.some(catId =>
    p.idCategories.includes(catId)
  );

  const appliesByProduct = pos.descuento.productsIds?.includes(p.id);

  const discount = (appliesByCategory || appliesByProduct) ? pos.descuento.porcentaje : null;

  return { ...p, discount };
}

/** FUNCIÓN PURA */
function applyPosCashDiscount(p: IProduct, pos?: PointOfSale | null): IProduct {
  if (!pos?.descuentoEfectivo) return { ...p, cashDiscount: undefined };

  const appliesByCategory = pos.descuentoEfectivo.categoryIds?.some(catId =>
    p.idCategories.includes(catId)
  );

  const appliesByProduct = pos.descuentoEfectivo.productsIds?.includes(p.id);

  const cashDiscount = (appliesByCategory || appliesByProduct) ? pos.descuentoEfectivo.porcentaje : undefined;

  return { ...p, cashDiscount };
}