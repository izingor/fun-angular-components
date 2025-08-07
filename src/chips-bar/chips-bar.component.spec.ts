import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { FilterChipsComponent } from './chips-bar.component';
import { FilterChip } from './filter-chip.interface';

describe('FilterChipsComponent', () => {
  let component: FilterChipsComponent;
  let fixture: ComponentFixture<FilterChipsComponent>;

  const mockFilters: FilterChip[] = [
    { id: 1, label: 'Category: Electronics' },
    { id: 2, label: 'Price: $100-$200' },
    { id: 'brand', label: 'Brand: Apple' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FilterChipsComponent,
        MatChipsModule,
        MatIconModule,
        NoopAnimationsModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterChipsComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.filters).toEqual([]);
      expect(component.isExpanded).toBeFalse();
    });

    it('should initialize with empty filterRemoved EventEmitter', () => {
      expect(component.filterRemoved).toBeDefined();
      expect(component.filterRemoved.observers.length).toBe(0);
    });
  });

  describe('Input Properties', () => {
    it('should accept filters input', () => {
      component.filters = mockFilters;
      fixture.detectChanges();

      expect(component.filters).toEqual(mockFilters);
      expect(component.filters.length).toBe(3);
    });

    it('should display correct filter count in header', () => {
      component.filters = mockFilters;
      fixture.detectChanges();

      const filterCount = fixture.debugElement.query(By.css('.filter-count'));
      expect(filterCount.nativeElement.textContent.trim()).toBe('3');
    });

    it('should handle empty filters array', () => {
      component.filters = [];
      fixture.detectChanges();

      const filterCount = fixture.debugElement.query(By.css('.filter-count'));
      expect(filterCount.nativeElement.textContent.trim()).toBe('0');
    });
  });

  describe('Toggle Functionality', () => {
    it('should toggle isExpanded when toggleExpanded is called', () => {
      expect(component.isExpanded).toBeFalse();
      
      component.toggleExpanded();
      expect(component.isExpanded).toBeTrue();
      
      component.toggleExpanded();
      expect(component.isExpanded).toBeFalse();
    });

    it('should toggle when filter header is clicked', () => {
      const filterHeader = fixture.debugElement.query(By.css('.filter-header'));
      
      expect(component.isExpanded).toBeFalse();
      
      filterHeader.nativeElement.click();
      expect(component.isExpanded).toBeTrue();
      
      filterHeader.nativeElement.click();
      expect(component.isExpanded).toBeFalse();
    });

    it('should show correct icon based on expanded state', () => {
      fixture.detectChanges();
      const toggleIcon = fixture.debugElement.query(By.css('.filter-toggle-icon'));
      
      // Initially collapsed
      expect(toggleIcon.nativeElement.textContent.trim()).toBe('keyboard_arrow_down');
      
      // After expanding
      component.toggleExpanded();
      fixture.detectChanges();
      expect(toggleIcon.nativeElement.textContent.trim()).toBe('keyboard_arrow_up');
    });
  });

  describe('Filter Display', () => {
    beforeEach(() => {
      component.filters = mockFilters;
      component.isExpanded = true;
      fixture.detectChanges();
    });

    it('should display filter chips when expanded', () => {
      const filterChipsContainer = fixture.debugElement.query(By.css('.filter-chips'));
      expect(filterChipsContainer).toBeTruthy();
      
      const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
      expect(chips.length).toBe(3);
    });

    it('should not display filter chips when collapsed', () => {
      component.isExpanded = false;
      fixture.detectChanges();
      
      const filterChipsContainer = fixture.debugElement.query(By.css('.filter-chips'));
      expect(filterChipsContainer).toBeFalsy();
    });

    it('should display correct filter labels', () => {
      const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
      
      expect(chips[0].nativeElement.textContent).toContain('Category: Electronics');
      expect(chips[1].nativeElement.textContent).toContain('Price: $100-$200');
      expect(chips[2].nativeElement.textContent).toContain('Brand: Apple');
    });

    it('should display remove icons for each chip', () => {
      const removeIcons = fixture.debugElement.queryAll(By.css('.remove-icon'));
      expect(removeIcons.length).toBe(3);
      
      removeIcons.forEach(icon => {
        expect(icon.nativeElement.textContent.trim()).toBe('cancel');
      });
    });
  });

  describe('Filter Removal', () => {
    beforeEach(() => {
      component.filters = mockFilters;
      component.isExpanded = true;
      fixture.detectChanges();
    });

    it('should emit filterRemoved event when removeFilter is called', () => {
      spyOn(component.filterRemoved, 'emit');
      
      component.removeFilter(1);
      
      expect(component.filterRemoved.emit).toHaveBeenCalledWith(1);
    });

    it('should emit filterRemoved event when remove icon is clicked', () => {
      spyOn(component.filterRemoved, 'emit');
      
      const removeIcons = fixture.debugElement.queryAll(By.css('.remove-icon'));
      removeIcons[0].nativeElement.click();
      
      expect(component.filterRemoved.emit).toHaveBeenCalledWith(1);
    });

    it('should emit correct filter id for different chip types', () => {
      spyOn(component.filterRemoved, 'emit');
      
      // Test numeric id
      component.removeFilter(1);
      expect(component.filterRemoved.emit).toHaveBeenCalledWith(1);
      
      // Test string id
      component.removeFilter('brand');
      expect(component.filterRemoved.emit).toHaveBeenCalledWith('brand');
    });

    it('should emit filterRemoved for each remove icon click', () => {
      spyOn(component.filterRemoved, 'emit');
      
      const removeIcons = fixture.debugElement.queryAll(By.css('.remove-icon'));
      
      removeIcons[0].nativeElement.click();
      expect(component.filterRemoved.emit).toHaveBeenCalledWith(1);
      
      removeIcons[1].nativeElement.click();
      expect(component.filterRemoved.emit).toHaveBeenCalledWith(2);
      
      removeIcons[2].nativeElement.click();
      expect(component.filterRemoved.emit).toHaveBeenCalledWith('brand');
    });
  });

  describe('CSS Classes', () => {
    it('should apply expanded class when isExpanded is true', () => {
      component.filters = mockFilters;
      component.isExpanded = true;
      fixture.detectChanges();
      
      const filterChips = fixture.debugElement.query(By.css('.filter-chips'));
      expect(filterChips.nativeElement.classList).toContain('expanded');
    });

    it('should not apply expanded class when isExpanded is false', () => {
      component.filters = mockFilters;
      component.isExpanded = false;
      fixture.detectChanges();
      
      const filterChips = fixture.debugElement.query(By.css('.filter-chips'));
      expect(filterChips).toBeFalsy(); // Element shouldn't exist when collapsed
    });
  });

  describe('Edge Cases', () => {
    it('should handle filters with special characters in labels', () => {
      const specialFilters: FilterChip[] = [
        { id: 1, label: 'Category: "Special & Unique"' },
        { id: 2, label: 'Price: <$50' }
      ];
      
      component.filters = specialFilters;
      component.isExpanded = true;
      fixture.detectChanges();
      
      const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
      expect(chips[0].nativeElement.textContent).toContain('Category: "Special & Unique"');
      expect(chips[1].nativeElement.textContent).toContain('Price: <$50');
    });

    it('should handle single filter', () => {
      const singleFilter: FilterChip[] = [{ id: 'single', label: 'Single Filter' }];
      
      component.filters = singleFilter;
      component.isExpanded = true;
      fixture.detectChanges();
      
      const filterCount = fixture.debugElement.query(By.css('.filter-count'));
      expect(filterCount.nativeElement.textContent.trim()).toBe('1');
      
      const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
      expect(chips.length).toBe(1);
    });

    it('should handle very long filter labels', () => {
      const longLabelFilter: FilterChip[] = [{
        id: 'long',
        label: 'This is a very long filter label that might cause layout issues if not handled properly'
      }];
      
      component.filters = longLabelFilter;
      component.isExpanded = true;
      fixture.detectChanges();
      
      const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
      expect(chips.length).toBe(1);
      expect(chips[0].nativeElement.textContent).toContain('This is a very long filter label');
    });
  });
});
