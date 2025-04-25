import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryTreeService {

  showTree = new BehaviorSubject<boolean>(false)

  $showTree = this.showTree.asObservable()

  toggleShowTree(){
    this.showTree.next(!this.showTree.value)
  }

  constructor() { }
}
