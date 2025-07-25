import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, startWith, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PointOfSale } from '../interfaces/pointofsale.interface';
import { POINTS_OF_SALE } from '../data/points_of_sale';

const PV_STORAGE_KEY = 'point-of-sale-id';
const DEFAULT_PV_ID = 'giza';

@Injectable({ providedIn: 'root' })
export class PointOfSaleService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Fuente reactiva: PV que viene de la URL o de alguna otra parte */
  private pvFromUrlSubject = new BehaviorSubject<string | null>(null);

  /** Observable de PV final (con fallback y persistencia) */
  readonly pos$ = this.pvFromUrlSubject.pipe(
    map(pvId => {
      // 1) Si vino de la URL y es válido, se usa
      if (pvId && this.isValidPv(pvId)) {
        return this.getPointOfSaleById(pvId) ?? null;
      }

      // 2) Si no hay pvId de URL, leer localStorage
      if (isPlatformBrowser(this.platformId)) {
        const stored = localStorage.getItem(PV_STORAGE_KEY);
        if (stored && this.isValidPv(stored)) {
          return this.getPointOfSaleById(stored) ?? null;
        }
      }

      // 3) Fallback (giza)
      return this.getPointOfSaleById(DEFAULT_PV_ID) ?? null;
    }),
    distinctUntilChanged((a, b) => a?.id === b?.id),
    tap(pos => {
      if (isPlatformBrowser(this.platformId) && pos) {
        localStorage.setItem(PV_STORAGE_KEY, pos.id);
      }
    }),
    startWith(this.getPointOfSaleById(DEFAULT_PV_ID) ?? null)
  );

  /** Método reactivo para setear pv (ej: desde router param) */
  setPvFromUrl(pvId: string | null) {
    this.pvFromUrlSubject.next(pvId);
  }

  /** Helpers */
  private isValidPv(pvId: string): boolean {
    return POINTS_OF_SALE.some(pos => pos.id === pvId);
  }

  public getPointOfSaleById(pvId: string): PointOfSale | undefined {
    return POINTS_OF_SALE.find(pos => pos.id === pvId);
  }
}