import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PopoverComponent, PopoverPlacement } from '../popover/popover.component';
import { ChipsBarComponent } from '../chips-bar/chips-bar.component';
import { FilterChip } from '../chips-bar/filter-chip.interface';

@Component({
  selector: 'app-root',
  imports: [PopoverComponent, CommonModule, ChipsBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fun';

  placements: PopoverPlacement[] = ['bottom', 'top', 'left', 'right'];
  currentPlacement: PopoverPlacement = 'bottom';

  activeFilters: FilterChip[] = [
    { id: 'customerDate', label: 'Customer: July 1-15' },
    { id: 'shipCount', label: 'Ship: 3 Selected' },
    { id: 'weight', label: 'Weight in kg' },
    { id: 'openDate', label: 'Open date' },
    { id: 'type', label: 'Type: Air' },
    { id: 'station', label: 'Customer Station: 2 selected' }
  ];

  onButtonClick() {
    console.log('Button clicked');
  }

  changePlacement(placement: PopoverPlacement) {
    this.currentPlacement = placement;
  }

  onFilterRemoved(filterIdToRemove: string | number): void {
    this.activeFilters = this.activeFilters.filter(
      (filter) => filter.id !== filterIdToRemove
    );
    console.log(`Filter with ID: ${filterIdToRemove} has been removed.`);
  }
}
