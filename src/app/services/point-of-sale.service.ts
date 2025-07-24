import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PointOfSale } from '../interfaces/pointofsale.interface';
import { POINTS_OF_SALE } from '../data/points_of_sale';

const PV_STORAGE_KEY = 'point-of-sale-id';

@Injectable({
  providedIn: 'root'
})
export class PointOfSaleService {

  pos = new BehaviorSubject<PointOfSale | null>(POINTS_OF_SALE.find(pos => pos.id === 'giza') ?? null);

  $pos = this.pos.asObservable();

  private readonly platformId = inject(PLATFORM_ID);

  // Setter
  setPv(pvId: string | null) {

    const fallbackId = 'giza';

    if (!pvId) {
      // Si no paso pvId, intento leer de localStorage
      if (isPlatformBrowser(this.platformId)) {
        const storedPvId = localStorage.getItem(PV_STORAGE_KEY);
        if (storedPvId && this.isValidPv(storedPvId)) {
          this.pos.next(this.getPointOfSaleById(storedPvId) ?? null);
          return;
        }
      }
      // Si no hay nada en localStorage o no es válido, fallback
      this.pos.next(this.getPointOfSaleById(fallbackId) ?? null);
      return;
    }

    // Si paso pvId, validarlo y setear
    if (this.isValidPv(pvId)) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(PV_STORAGE_KEY, pvId);
      }
      this.pos.next(this.getPointOfSaleById(pvId) ?? null);
    } else {
      // pvId inválido, limpiar localStorage y fallback
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(PV_STORAGE_KEY);
      }
      this.pos.next(this.getPointOfSaleById(fallbackId) ?? null);
    }
  }

  getPointOfSaleById(pvId: string): PointOfSale | undefined {
    return POINTS_OF_SALE.find(pos => pos.id === pvId)
  }

  clearPv() {
    this.setPv(null);
  }

  isValidPv(pvId: string): boolean {
    return POINTS_OF_SALE.some(pos => pos.id === pvId);
  }

}
