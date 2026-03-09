import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timescale } from '../../models/work-order.models';

@Component({
  selector: 'app-timescale-dropdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timescale-dropdown.html',
  styleUrl: './timescale-dropdown.scss',
})
export class TimescaleDropdown {
  @Input() current: Timescale = 'Month';
  @Output() changed = new EventEmitter<Timescale>();

  open = false;
  options: Timescale[] = ['Hour', 'Day', 'Week', 'Month'];

  constructor(private el: ElementRef) {}

  toggle(): void {
    this.open = !this.open;
  }
  select(ts: Timescale): void {
    this.open = false;
    this.changed.emit(ts);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) this.open = false;
  }
}
