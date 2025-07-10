import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PointOfSale } from '../interfaces/pointofsale.interface';
import { POINTS_OF_SALE } from '../data/points_of_sale';


const PV_STORAGE_KEY = 'point-of-sale-id';

@Injectable({
  providedIn: 'root'
})
export class PointOfSaleService {

  private _pvSubject: BehaviorSubject<string | null>;

  private isBrowser!: boolean;

  // Observable público
  pv$: Observable<string | null>;

  constructor(@Inject(PLATFORM_ID) platformId: Object){
    this.isBrowser = isPlatformBrowser(platformId);
    const storedPv = this.isBrowser ? localStorage.getItem(PV_STORAGE_KEY) : null;
    this._pvSubject = new BehaviorSubject<string | null>(storedPv);
    this.pv$ = this._pvSubject.asObservable();
  }


  // Setter
  setPv(value: string | null) {
    if (!value || !this.isValidPv(value)) {
      // Si el valor es null o no es válido, limpiamos
      if (this.isBrowser) localStorage.removeItem(PV_STORAGE_KEY);
      this._pvSubject.next(null);
    } else {
      // Si es válido, lo guardamos
      if (this.isBrowser) localStorage.setItem(PV_STORAGE_KEY, value);
      this._pvSubject.next(value);
    }
  }

  getCurrentPointOfSale(): PointOfSale | null {
    const pv = this._pvSubject.getValue();
    return POINTS_OF_SALE.find(pos => pos.id === pv) ?? POINTS_OF_SALE.find(pos => pos.id === 'giza') ?? null;
  }

  getPointOfSaleById(pvId: string): PointOfSale | undefined {
    return POINTS_OF_SALE.find(pos => pos.id === pvId)
  }


  clearPv() {
    this.setPv(null);
  }


  isValidPv(pv: string): boolean {
    return POINTS_OF_SALE.some(pos => pos.id === pv);
  }

}
