import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrderDocument, STATUS_LABELS } from '../../models/work-order.models';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work-order-bar.html',
  styleUrl: './work-order-bar.scss',
})
export class WorkOrderBar {
  @Input() order!: WorkOrderDocument;
  @Input() x = 0;
  @Input() width = 0;
  @Input() top = 0;

  @Output() edit = new EventEmitter<WorkOrderDocument>();
  @Output() delete = new EventEmitter<string>();

  isHovered = signal(false);
  menuOpen = signal(false);
  menuX = 0;
  menuY = 0;

  get statusLabel(): string {
    return STATUS_LABELS[this.order.data.status];
  }

  onBarMouseLeave(e: MouseEvent): void {
    const to = e.relatedTarget as HTMLElement | null;
    if (to?.closest('.ctx-menu')) return;
    this.isHovered.set(false);
  }

  toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.menuOpen()) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      this.menuX = Math.max(4, rect.right - 110);
      this.menuY = rect.bottom + 4;
    }
    this.menuOpen.set(!this.menuOpen());
  }

  doEdit(): void {
    this.menuOpen.set(false);
    this.isHovered.set(false);
    this.edit.emit(this.order);
  }
  doDelete(): void {
    this.menuOpen.set(false);
    this.isHovered.set(false);
    this.delete.emit(this.order.docId);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.menuOpen()) {
      const t = e.target as HTMLElement;
      if (!t.closest('.menu-btn') && !t.closest('.ctx-menu')) {
        this.menuOpen.set(false);
      }
    }
  }
}
