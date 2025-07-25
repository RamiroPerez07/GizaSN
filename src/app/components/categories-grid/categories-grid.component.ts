import { Component, Input} from '@angular/core';
import { ICategory } from '../../interfaces/categories.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-categories-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-grid.component.html',
  styleUrl: './categories-grid.component.css'
})
export class CategoriesGridComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) categories!: ICategory[];

  constructor(private readonly router: Router) {}

  redirectTo(categoryId: string) {
    this.router.navigate(['products', 'category', categoryId]);
  }
}