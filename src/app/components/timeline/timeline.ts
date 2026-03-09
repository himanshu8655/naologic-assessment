import {
  Component, OnInit, AfterViewInit, ViewChild, ElementRef,
  signal, computed, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkOrderService } from '../../services/work-order.service';
import { DateUtilsService } from '../../services/date-utils.service';
import {
  Timescale, TimelineColumn, WorkCenterDocument, WorkOrderDocument
} from '../../models/work-order.models';
import { TimescaleDropdown } from "../timescale-dropdown/timescale-dropdown";
import { WorkOrderBar } from '../work-order-bar/work-order-bar';
import { WorkOrderPanel } from '../work-order-panel/work-order-panel';

interface RowRenderData {
  workCenter: WorkCenterDocument;
  bars: { order: WorkOrderDocument; x: number; width: number; }[];
}

interface BarRenderData {
  order: WorkOrderDocument;
  x: number;
  width: number;
}
  
@Component({
  selector: 'app-timeline',
  imports: [TimescaleDropdown, WorkOrderBar, WorkOrderPanel, CommonModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline implements OnInit, AfterViewInit {
  @ViewChild('tlRight')   tlRight!:   ElementRef<HTMLDivElement>;
  @ViewChild('headRight') headRight!: ElementRef<HTMLDivElement>;
  @ViewChild('tlLeft')    tlLeft!:    ElementRef<HTMLDivElement>;

  // ── Timescale ──────────────────────────────────────────────────
  currentTimescale = signal<Timescale>('Month');
  columns          = signal<TimelineColumn[]>([]);
  rangeStart!: Date;
  rangeEnd!:   Date;

  // ── Layout ─────────────────────────────────────────────────────
  readonly LEFT_COL_WIDTH = 215;
  readonly ROW_HEIGHT      = 44;

  totalWidth = computed(() => this.columns().reduce((s, c) => s + c.width, 0));

  // ── Today line ─────────────────────────────────────────────────
  todayX = signal(0);

  // ── Rendered rows ──────────────────────────────────────────────
  rows = computed<RowRenderData[]>(() => {
    const cols = this.columns();
    if (!cols.length) return [];
    return this.workOrderService.workCenters().map(wc => ({
      workCenter: wc,
      bars: this.buildBars(wc.docId),
    }));
  });

  // ── Panel ──────────────────────────────────────────────────────
  panelOpen        = signal(false);
  panelMode        = signal<'create' | 'edit'>('create');
  panelWorkCenter  = signal<string>('');
  panelPrefillDate = signal<string>('');
  panelEditOrderId = signal<string | null>(null);

  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;

  constructor(
    public workOrderService: WorkOrderService,
    public dateUtils: DateUtilsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildTimeline();
  }

  ngAfterViewInit(): void {
    this.setupScrollSync();
    requestAnimationFrame(() => this.scrollToToday());
  }

  // ── Build timeline ─────────────────────────────────────────────
  buildTimeline(): void {
    const ts   = this.currentTimescale();
    const cols = this.dateUtils.buildColumns(ts);
    this.columns.set(cols);

    this.rangeStart = cols[0].date;
    this.rangeEnd   = this.dateUtils.nextPeriod(cols[cols.length - 1].date, ts);

    const tx = this.dateUtils.dateToX(
      this.dateUtils.today(), this.rangeStart, this.rangeEnd, this.totalWidth()
    );
    this.todayX.set(tx);
  }

  onTimescaleChange(ts: Timescale): void {
    this.currentTimescale.set(ts);
    this.buildTimeline();
    this.cdr.markForCheck();
    requestAnimationFrame(() => this.scrollToToday());
  }

  // ── Scroll ─────────────────────────────────────────────────────
  scrollToToday(): void {
    if (!this.tlRight?.nativeElement) return;
    const el = this.tlRight.nativeElement;
    el.scrollLeft = this.todayX() - el.offsetWidth / 2;
    if (this.headRight?.nativeElement) {
      this.headRight.nativeElement.scrollLeft = el.scrollLeft;
    }
  }

  setupScrollSync(): void {
    const right = this.tlRight.nativeElement;
    const head  = this.headRight.nativeElement;
    const left  = this.tlLeft.nativeElement;

    right.addEventListener('scroll', () => {
      head.scrollLeft = right.scrollLeft;
      left.scrollTop  = right.scrollTop;
    }, { passive: true });

    left.addEventListener('scroll', () => {
      right.scrollTop = left.scrollTop;
    }, { passive: true });
  }

  onRowMouseMove(e: MouseEvent): void {
  if ((e.target as HTMLElement).closest('.wo-bar')) {
    this.tooltipVisible = false;
    return;
  }
  this.tooltipVisible = true;
  this.tooltipX = e.clientX + 14;
  this.tooltipY = e.clientY - 30;
}

onRowMouseLeave(): void {
  this.tooltipVisible = false;
}

  // ── Bar rendering ──────────────────────────────────────────────
  buildBars(wcId: string): BarRenderData[] {
    const tw = this.totalWidth();
    return this.workOrderService.getOrdersForWorkCenter(wcId)
      .map(order => {
        const s = this.dateUtils.parseDate(order.data.startDate);
        const e = this.dateUtils.parseDate(order.data.endDate);
        let x1  = this.dateUtils.dateToX(s, this.rangeStart, this.rangeEnd, tw);
        let x2  = this.dateUtils.dateToX(e, this.rangeStart, this.rangeEnd, tw);
        if (x2 < 0 || x1 > tw) return null;
        x1 = Math.max(0, x1);
        x2 = Math.min(tw, x2);
        return { order, x: x1, width: Math.max(56, x2 - x1) };
      })
      .filter((b): b is BarRenderData => b !== null);
  }

  // ── Row click (create) ─────────────────────────────────────────
  onRowClick(event: MouseEvent, wcId: string): void {
    if ((event.target as HTMLElement).closest('.wo-bar')) return;

    const right   = this.tlRight.nativeElement;
    const rect    = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x       = event.clientX - rect.left + right.scrollLeft;
    const clicked = this.dateUtils.xToDate(x, this.rangeStart, this.rangeEnd, this.totalWidth());
    const snapped = this.dateUtils.snapToStart(clicked, this.currentTimescale());

    this.panelMode.set('create');
    this.panelWorkCenter.set(wcId);
    this.panelPrefillDate.set(this.dateUtils.toISO(snapped));
    this.panelEditOrderId.set(null);
    this.panelOpen.set(true);
  }

  // ── Bar actions ────────────────────────────────────────────────
  onEditOrder(order: WorkOrderDocument): void {
    this.panelMode.set('edit');
    this.panelEditOrderId.set(order.docId);
    this.panelWorkCenter.set(order.data.workCenterId);
    this.panelPrefillDate.set(order.data.startDate);
    this.panelOpen.set(true);
  }

  onDeleteOrder(docId: string): void {
    this.workOrderService.deleteWorkOrder(docId);
    this.cdr.markForCheck();
  }

  // ── Panel events ───────────────────────────────────────────────
  onPanelClose(): void {
    this.panelOpen.set(false);
  }

  onPanelSave(payload: {
    name: string;
    status: any;
    startDate: string;
    endDate: string;
  }): void {
    if (this.panelMode() === 'create') {
      this.workOrderService.createWorkOrder({
        ...payload,
        workCenterId: this.panelWorkCenter(),
      });
    } else {
      const id = this.panelEditOrderId();
      if (id) this.workOrderService.updateWorkOrder(id, payload);
    }
    this.panelOpen.set(false);
    this.cdr.markForCheck();
  }

  // ── Helpers for template ───────────────────────────────────────
  trackByWcId(_: number, row: RowRenderData): string {
    return row.workCenter.docId;
  }

  trackByOrderId(_: number, bar: BarRenderData): string {
    return bar.order.docId;
  }

  trackByColDate(_: number, col: TimelineColumn): number {
    return col.date.getTime();
  }

  get gridHeight(): number {
    return this.workOrderService.workCenters().length * this.ROW_HEIGHT;
  }
}