import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import {
  NgSelectComponent,
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
} from '@ng-select/ng-select';
import { NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { WorkOrderService } from '../../services/work-order.service';
import { DateUtilsService } from '../../services/date-utils.service';
import { WorkOrderStatus, STATUS_OPTIONS } from '../../models/work-order.models';

function endAfterStart(group: AbstractControl) {
  const start = group.get('startDate')?.value as NgbDateStruct | null;
  const end = group.get('endDate')?.value as NgbDateStruct | null;
  if (!start || !end) return null;
  const s = new Date(start.year, start.month - 1, start.day);
  const e = new Date(end.year, end.month - 1, end.day);
  return e <= s ? { endBeforeStart: true } : null;
}

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectComponent,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgbDatepicker,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work-order-panel.html',
  styleUrl: './work-order-panel.scss',
})
export class WorkOrderPanel implements OnChanges {
  @Input() open = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() workCenterId = '';
  @Input() prefillStartDate = '';
  @Input() editOrderId: string | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{
    name: string;
    status: WorkOrderStatus;
    startDate: string;
    endDate: string;
  }>();

  form!: FormGroup;
  statusOptions = STATUS_OPTIONS;
  showOverlapError = false;

  startPickerOpen = signal(false);
  endPickerOpen = signal(false);

  constructor(
    private fb: FormBuilder,
    private woService: WorkOrderService,
    private dateUtils: DateUtilsService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        status: ['open', Validators.required],
        startDate: [null, Validators.required],
        endDate: [null, Validators.required],
      },
      { validators: endAfterStart },
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.showOverlapError = false;
      this.startPickerOpen.set(false);
      this.endPickerOpen.set(false);
      this.form.reset({ status: 'open' });

      if (this.mode === 'create') {
        const start = this.prefillStartDate
          ? this.dateUtils.parseDate(this.prefillStartDate)
          : this.dateUtils.today();
        const end = this.dateUtils.addDays(start, 7);
        this.form.patchValue({
          name: '',
          status: 'open',
          startDate: this.toNgb(start),
          endDate: this.toNgb(end),
        });
      } else if (this.mode === 'edit' && this.editOrderId) {
        const order = this.woService.workOrders().find((o) => o.docId === this.editOrderId);
        if (order) {
          this.form.patchValue({
            name: order.data.name,
            status: order.data.status,
            startDate: this.toNgb(this.dateUtils.parseDate(order.data.startDate)),
            endDate: this.toNgb(this.dateUtils.parseDate(order.data.endDate)),
          });
        }
      }
      this.cdr.markForCheck();
    }
  }

  toNgb(d: Date): NgbDateStruct {
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }
  fromNgb(d: NgbDateStruct): string {
    return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
  }
  displayNgb(d: NgbDateStruct | null): string {
    if (!d) return '';
    return `${String(d.month).padStart(2, '0')}/${String(d.day).padStart(2, '0')}/${d.year}`;
  }

  get nameCtrl(): FormControl {
    return this.form.get('name') as FormControl;
  }
  get statusCtrl(): FormControl {
    return this.form.get('status') as FormControl;
  }
  get startDateCtrl(): FormControl {
    return this.form.get('startDate') as FormControl;
  }
  get endDateCtrl(): FormControl {
    return this.form.get('endDate') as FormControl;
  }
  get endBeforeStart(): boolean {
    return !!this.form.errors?.['endBeforeStart'] && this.endDateCtrl.touched;
  }
  get saveLabel(): string {
    return this.mode === 'create' ? 'Create' : 'Save';
  }

  toggleStartPicker(): void {
    this.endPickerOpen.set(false);
    this.startPickerOpen.set(!this.startPickerOpen());
  }
  toggleEndPicker(): void {
    this.startPickerOpen.set(false);
    this.endPickerOpen.set(!this.endPickerOpen());
  }
  onStartDateSelect(): void {
    this.startPickerOpen.set(false);
  }
  onEndDateSelect(): void {
    this.endPickerOpen.set(false);
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name, status, startDate, endDate } = this.form.value;
    const startISO = this.fromNgb(startDate);
    const endISO = this.fromNgb(endDate);

    const hasOverlap = this.woService.hasOverlap(
      this.workCenterId,
      startISO,
      endISO,
      this.mode === 'edit' ? (this.editOrderId ?? undefined) : undefined,
    );
    if (hasOverlap) {
      this.showOverlapError = true;
      this.cdr.markForCheck();
      return;
    }
    this.showOverlapError = false;
    this.saved.emit({ name, status, startDate: startISO, endDate: endISO });
  }

  onClose(): void {
    this.closed.emit();
  }
}
