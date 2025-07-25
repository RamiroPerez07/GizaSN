import { Injectable } from '@angular/core';
import { BehaviorSubject, shareReplay, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryTreeService {
  // ---- Eventos de toggle
  private toggleSubject = new BehaviorSubject<boolean>(false);

  // ---- Estado derivado
  readonly showTree$ = this.toggleSubject.pipe(
    startWith(false),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() {}

  toggleShowTree() {
    this.toggleSubject.next(!this.toggleSubject.value);
  }
}
