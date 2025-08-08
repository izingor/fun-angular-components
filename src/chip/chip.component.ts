import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-chip',
  imports: [CommonModule, MatChipsModule, MatIconModule, MatTooltipModule],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss'
})
export class ChipComponent {
  @Input() id!: string;
  @Input() label!: string;
  @Input() disabled = false;
  @Input() selected = false;
  @Input() truncationThreshold = 24;

  @Output() removed = new EventEmitter<string>();
  @Output() chipClick = new EventEmitter<string>();

  truncated = computed(() => this.label?.length > this.truncationThreshold);

  onClick(): void {
    if (this.disabled) return;
    this.chipClick.emit(this.id);
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.removed.emit(this.id);
  }

}
