import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChipComponent } from './chip.component';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;

  function setup(inputs: Partial<ChipComponent>): void {
    fixture = TestBed.createComponent(ChipComponent);
    component = fixture.componentInstance;
    Object.assign(component, inputs);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipComponent]
    }).compileComponents();
  });

  it('should create', () => {
    setup({ id: 'a', label: 'Alpha' });
    expect(component).toBeTruthy();
  });

  it('should render the label', () => {
    const label = 'Test Label';
    setup({ id: '1', label });
    const chipEl = fixture.debugElement.query(By.css('mat-chip'));
    expect(chipEl.nativeElement.textContent).toContain(label);
  });

  it('should emit chipClick when clicked (enabled)', () => {
    setup({ id: '1', label: 'Clickable' });
    spyOn(component.chipClick, 'emit');
    const chipEl = fixture.debugElement.query(By.css('mat-chip'));
    chipEl.nativeElement.click();
    expect(component.chipClick.emit).toHaveBeenCalledWith('1');
  });

  it('should not emit chipClick when disabled', () => {
    setup({ id: '1', label: 'Disabled', disabled: true });
    spyOn(component.chipClick, 'emit');
    const chipEl = fixture.debugElement.query(By.css('mat-chip'));
    chipEl.nativeElement.click();
    expect(component.chipClick.emit).not.toHaveBeenCalled();
  });

  it('should emit removed when remove icon clicked', () => {
    setup({ id: '1', label: 'Removable' });
    spyOn(component.removed, 'emit');
    const removeIcon = fixture.debugElement.query(By.css('.chip-remove-icon'));
    expect(removeIcon).toBeTruthy();
    removeIcon.nativeElement.click();
    expect(component.removed.emit).toHaveBeenCalledWith('1');
  });

  it('should not show remove icon when disabled', () => {
    setup({ id: '1', label: 'No Remove', disabled: true });
    const removeIcon = fixture.debugElement.query(By.css('.chip-remove-icon'));
    expect(removeIcon).toBeFalsy();
  });

  it('should apply selected class when selected is true', () => {
    setup({ id: '1', label: 'Selected', selected: true });
    const chipEl = fixture.debugElement.query(By.css('mat-chip'));
    expect(chipEl.nativeElement.classList).toContain('selected');
  });

  it('should toggle selected class when input changes', () => {
    setup({ id: '1', label: 'Toggle', selected: false });
    let chipEl = fixture.debugElement.query(By.css('mat-chip'));
    expect(chipEl.nativeElement.classList).not.toContain('selected');
    component.selected = true;
    fixture.detectChanges();
    chipEl = fixture.debugElement.query(By.css('mat-chip'));
    expect(chipEl.nativeElement.classList).toContain('selected');
  });

  it('should add truncated class when label exceeds threshold', () => {
    const longLabel = 'X'.repeat(40);
    setup({ id: '1', label: longLabel, truncationThreshold: 24 });
    const span = fixture.debugElement.query(By.css('.chip-label'));
    expect(span.nativeElement.classList).toContain('truncated');
  });

  it('should not add truncated class when label within threshold', () => {
    const shortLabel = 'Short label';
    setup({ id: '1', label: shortLabel, truncationThreshold: 50 });
    const span = fixture.debugElement.query(By.css('.chip-label'));
    expect(span.nativeElement.classList).not.toContain('truncated');
  });
});
