import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FilterChip } from './filter-chip.interface';

@Component({
  selector: 'app-filter-chips',
  imports: [CommonModule, MatChipsModule, MatIconModule],
  templateUrl: './chips-bar.component.html',
  styleUrl: './chips-bar.component.scss'
})
export class FilterChipsComponent {
  @Input() filters: FilterChip[] = [];
  @Output() filterRemoved = new EventEmitter<string | number>();

  isExpanded = false;

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  removeFilter(filterId: string | number): void {
    this.filterRemoved.emit(filterId);
  }
}
