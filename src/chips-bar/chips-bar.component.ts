import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FilterChip } from "./filter-chip.interface";

@Component({
    selector: "chips-bar",
    imports: [CommonModule, MatChipsModule, MatIconModule, MatTooltipModule],
    templateUrl: "./chips-bar.component.html",
    styleUrl: "./chips-bar.component.scss",
})
export class ChipsBarComponent {
    @Input() filters: FilterChip[] = [];
    @Input() type: "bar" | "dropdown" = "bar";
    @Output() chipRemoved = new EventEmitter<string>();
    @Output() chipClicked = new EventEmitter<string | null>();

    isExpanded = signal(false);
    private selectedChipIdSignal = signal<string | null>(null);

    selectedChipId() {
        return this.selectedChipIdSignal();
    }

    toggleExpanded(): void {
        if (this.type === "dropdown") this.isExpanded.update(prev => !prev);
    }

    removeFilter(filterId: string): void {
        const chip = this.filters.find(f => f.id === filterId);
        if (chip?.disabled) return; 
        this.chipRemoved.emit(filterId);
        if (this.selectedChipIdSignal() === filterId) {
            this.selectedChipIdSignal.set(null);
        }
    }

    selectChip(filterId: string): void {
        const chip = this.filters.find(f => f.id === filterId);
        if (chip?.disabled) return;
        if (this.selectedChipIdSignal() === filterId) {
            this.selectedChipIdSignal.set(null);
            this.chipClicked.emit(null);
            return;
        }
        this.selectedChipIdSignal.set(filterId);
        this.chipClicked.emit(filterId);
    }
}
