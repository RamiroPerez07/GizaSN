import { Component, inject, OnInit } from '@angular/core';
import { ExportOrdersFilters, OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { PointOfSaleService } from '../../services/point-of-sale.service';
import { PointOfSale } from '../../interfaces/pointofsale.interface';

@Component({
  selector: 'app-download-orders-excel-modal',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, ReactiveFormsModule],
  templateUrl: './download-orders-excel-modal.component.html',
  styleUrl: './download-orders-excel-modal.component.css'
})
export class DownloadOrdersExcelModalComponent implements OnInit {
  readonly ordersSvc = inject(OrdersService);
  private fb = inject(FormBuilder);
  readonly posSvc = inject(PointOfSaleService);

  isLoading = false;
  form!: FormGroup;

  showDownloadOrdersToExcelModal$ = this.ordersSvc.showDownloadOrdersToExcelModal$;

  posList!: PointOfSale[];

  dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;

    if (!from || !to) return null; // No validamos si falta algún dato

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const maxTo = new Date(fromDate);
    maxTo.setMonth(maxTo.getMonth() + 2);

    return toDate > maxTo ? { dateRangeTooLong: true } : null;
  };

  dateLimitsValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;

    if (!from || !to) return null; // No validamos si falta algún dato

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignorar horas/minutos/segundos para la comparación

    const errors: ValidationErrors = {};

    if (fromDate > today) {
      errors['fromInFuture'] = true; // from no puede ser mayor al día de hoy
    }

    if (toDate < fromDate) {
      errors['fromInFuture'] = true; // to no puede ser menor que from
    }

    return Object.keys(errors).length ? errors : null;
  };

  ngOnInit() {
    // Tipamos directamente con la interfaz ExportOrdersFilters
    this.form = this.fb.group({
      status: [''],
      posId: [''],
      buyer: [''],
      from: ['', Validators.required],
      to: ['', Validators.required]
    }, { validators: [this.dateRangeValidator, this.dateLimitsValidator] });

    this.posList = this.posSvc.getPointsOfSale();

  }

  closeModal() {
    this.ordersSvc.closeDownloadOrdersToExcelModal();
  }

  onExport() {

    if (this.form.invalid) {
      // Marcar todos los controles como touched para mostrar errores
      this.form.markAllAsTouched();
      return; // No hacemos la exportación
    }
    
    const filters = this.form.value as ExportOrdersFilters;
    this.isLoading = true;

    this.ordersSvc.exportOrdersToExcel(filters).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al generar Excel', err);
        this.isLoading = false;
      }
    });
  }
}
