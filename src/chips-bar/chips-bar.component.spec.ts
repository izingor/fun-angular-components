import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChipsBarComponent } from './chips-bar.component';
import { FilterChip } from './filter-chip.interface';

describe('ChipsBarComponent (updated)', () => {
  let component: ChipsBarComponent;
  let fixture: ComponentFixture<ChipsBarComponent>;

  const baseFilters: FilterChip[] = [
    { id: '1', label: 'Category: Electronics', value:'electronics' },
    { id: '2', label: 'Price: $100-$200', value:'100-200' },
    { id: 'brand', label: 'Brand: Apple', value:'apple' },
    { id: 'disabled', label: 'Disabled Chip Example', disabled: true, value:'disabled' },
    { id: 'long', label: 'This is a very long filter label that should truncate nicely', value:'long' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipsBarComponent, NoopAnimationsModule, MatTooltipModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ChipsBarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render provided filters as chips (bar mode)', () => {
    component.filters = baseFilters;
    fixture.detectChanges();
    const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
    expect(chips.length).toBe(baseFilters.length);
  });

  describe('Selection behaviour', () => {
    beforeEach(() => {
      component.filters = baseFilters;
      fixture.detectChanges();
    });

    it('should emit chipClicked and add selected class when a chip is clicked', () => {
      spyOn(component.chipClicked, 'emit');
      const firstChip = fixture.debugElement.queryAll(By.css('mat-chip'))[0];
      firstChip.nativeElement.click();
      fixture.detectChanges();
      expect(component.chipClicked.emit).toHaveBeenCalledWith('1');
      expect(firstChip.nativeElement.classList).toContain('selected');
    });

    it('should ensure only one chip is selected at a time', () => {
      const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
      chips[0].nativeElement.click();
      chips[1].nativeElement.click();
      fixture.detectChanges();
      expect(chips[0].nativeElement.classList).not.toContain('selected');
      expect(chips[1].nativeElement.classList).toContain('selected');
    });

    it('should not select or emit for disabled chip', () => {
      spyOn(component.chipClicked, 'emit');
      const disabledChip = fixture.debugElement.queryAll(By.css('mat-chip'))
        .find(de => de.nativeElement.textContent.includes('Disabled Chip Example'))!;
      disabledChip.nativeElement.click();
      fixture.detectChanges();
      expect(component.chipClicked.emit).not.toHaveBeenCalled();
      expect(disabledChip.nativeElement.classList).toContain('disabled');
      expect(disabledChip.nativeElement.classList).not.toContain('selected');
    });

    it('should deselect chip and emit null when clicking selected chip again', () => {
      spyOn(component.chipClicked, 'emit');
      const firstChip = fixture.debugElement.queryAll(By.css('mat-chip'))[0];
      firstChip.nativeElement.click();
      fixture.detectChanges();
      expect(component.selectedChipId()).toBe('1');
      firstChip.nativeElement.click();
      fixture.detectChanges();
      expect(component.selectedChipId()).toBeNull();
      expect(firstChip.nativeElement.classList).not.toContain('selected');
      const calls = (component.chipClicked.emit as jasmine.Spy).calls.allArgs();
      expect(calls[0][0]).toBe('1');
      expect(calls[1][0]).toBeNull();
    });
  });

  describe('Removal', () => {
    beforeEach(() => {
      component.filters = baseFilters;
      fixture.detectChanges();
    });

    it('should emit chipRemoved when clicking remove icon on enabled chip', () => {
      spyOn(component.chipRemoved, 'emit');
      const firstRemoveIcon = fixture.debugElement.queryAll(By.css('.chip-remove-icon'))[0];
      firstRemoveIcon.nativeElement.click();
      expect(component.chipRemoved.emit).toHaveBeenCalledWith('1');
    });

    it('should not show remove icon for disabled chip', () => {
      const disabledChip = fixture.debugElement.queryAll(By.css('mat-chip'))
        .find(de => de.nativeElement.textContent.includes('Disabled Chip Example'))!;
      const removeIcon = disabledChip.query(By.css('.chip-remove-icon'));
      expect(removeIcon).toBeFalsy();
    });

    it('should clear selection if selected chip is removed', () => {
      const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
      chips[1].nativeElement.click();
      fixture.detectChanges();
      expect(component.selectedChipId()).toBe('2');
      spyOn(component.chipRemoved, 'emit');
      const secondRemoveIcon = fixture.debugElement.queryAll(By.css('.chip-remove-icon'))[1];
      secondRemoveIcon.nativeElement.click();
      expect(component.chipRemoved.emit).toHaveBeenCalledWith('2');
      expect(component.selectedChipId()).toBeNull();
    });
  });

  describe('Truncation & Tooltip', () => {
    beforeEach(() => {
      component.filters = baseFilters;
      fixture.detectChanges();
    });

    it('should add truncated class for long label span', () => {
      const longChipSpan = fixture.debugElement.queryAll(By.css('.chip-label'))
        .find(de => de.nativeElement.textContent.includes('This is a very long'))!;
      expect(longChipSpan.nativeElement.classList).toContain('truncated');
    });

    it('should have tooltip directive applied for long chip', () => {
      const longChip = fixture.debugElement.queryAll(By.css('mat-chip'))
        .find(de => de.nativeElement.textContent.includes('This is a very long'))!;
      const hasTooltipAttr = longChip.attributes?.['ng-reflect-message'] || longChip.attributes?.['mattooltip'];
      expect(hasTooltipAttr).toBeDefined();
    });
  });

  describe('Dropdown type expansion', () => {
    it('should toggle expansion in dropdown mode', () => {
      component.type = 'dropdown';
      component.filters = baseFilters.slice(0, 2);
      fixture.detectChanges();
      const header = fixture.debugElement.query(By.css('.chips-dropdown-header'));
      expect(header).toBeTruthy();
      expect(component.isExpanded()).toBeFalse();
      header.nativeElement.click();
      expect(component.isExpanded()).toBeTrue();
      header.nativeElement.click();
      expect(component.isExpanded()).toBeFalse();
    });
  });
});
