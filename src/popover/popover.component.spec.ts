import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { OverlayModule, OverlayContainer } from '@angular/cdk/overlay';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PopoverComponent, PopoverPlacement } from './popover.component';

@Component({
  standalone: true,
  imports: [PopoverComponent],
  template: `
    <button #triggerButton>Trigger</button>
    <app-popover 
      #popover
      [trigger]="triggerButton"
      [placement]="placement"
      [width]="width"
      [maxWidth]="maxWidth"
      [offsetX]="offsetX"
      [offsetY]="offsetY"
      [isOpen]="isOpen"
      (openChange)="onOpenChange($event)">
      <div class="test-content">Test Content</div>
    </app-popover>
  `
})
class TestHostComponent {
  @ViewChild('triggerButton', { static: true }) triggerButton!: ElementRef;
  @ViewChild('popover', { static: true }) popover!: PopoverComponent;

  placement: PopoverPlacement = 'bottom';
  width?: string;
  maxWidth = '300px';
  offsetX = 0;
  offsetY = 8;
  isOpen = false;
  openChangeCount = 0;

  onOpenChange(isOpen: boolean) {
    this.isOpen = isOpen;
    this.openChangeCount++;
  }
}

describe('PopoverComponent', () => {
  let component: PopoverComponent;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        OverlayModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = hostComponent.popover;
    overlayContainer = TestBed.inject(OverlayContainer);
    
    fixture.detectChanges();
  });

  afterEach(() => {
    if (overlayContainer) {
      overlayContainer.ngOnDestroy();
    }
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default values', () => {
      expect(component.placement).toBe('bottom');
      expect(component.maxWidth).toBe('300px');
      expect(component.offsetX).toBe(0);
      expect(component.offsetY).toBe(8);
      expect(component.isOpen).toBe(false);
      expect(component.actualPlacement).toBe('bottom');
      expect(component.pointerOffset).toBe(0);
    });

    it('should accept input values', () => {
      hostComponent.placement = 'top';
      hostComponent.width = '200px';
      hostComponent.maxWidth = '400px';
      hostComponent.offsetX = 10;
      hostComponent.offsetY = 5;
      fixture.detectChanges();

      expect(component.placement).toBe('top');
      expect(component.width).toBe('200px');
      expect(component.maxWidth).toBe('400px');
      expect(component.offsetX).toBe(10);
      expect(component.offsetY).toBe(5);
    });
  });

  describe('Popover Opening and Closing', () => {
    it('should open popover when open() is called', fakeAsync(() => {
      expect(component.isOpen).toBe(false);
      
      component.open();
      tick();
      
      expect(component.isOpen).toBe(true);
      expect(hostComponent.openChangeCount).toBe(1);
      expect(hostComponent.isOpen).toBe(true);
    }));

    it('should close popover when close() is called', fakeAsync(() => {
      component.open();
      tick();
      expect(component.isOpen).toBe(true);
      
      component.close();
      tick();
      
      expect(component.isOpen).toBe(false);
      expect(hostComponent.openChangeCount).toBe(2);
      expect(hostComponent.isOpen).toBe(false);
    }));

    it('should toggle popover state', fakeAsync(() => {
      expect(component.isOpen).toBe(false);
      
      component.toggle();
      tick();
      expect(component.isOpen).toBe(true);
      
      component.toggle();
      tick();
      expect(component.isOpen).toBe(false);
    }));

    it('should emit openChange event when opening', fakeAsync(() => {
      spyOn(component.openChange, 'emit');
      
      component.open();
      tick();
      
      expect(component.openChange.emit).toHaveBeenCalledWith(true);
    }));

    it('should emit openChange event when closing', fakeAsync(() => {
      component.open();
      tick();
      
      spyOn(component.openChange, 'emit');
      component.close();
      tick();
      
      expect(component.openChange.emit).toHaveBeenCalledWith(false);
    }));

    it('should not open if no trigger is provided', () => {
      component.trigger = null as any;
      component.open();
      
      expect(component.isOpen).toBe(false);
    });
  });

  describe('Overlay Creation and DOM', () => {
    it('should create overlay when opening', fakeAsync(() => {
      component.open();
      tick();
      
      const overlayPanes = overlayContainer.getContainerElement().querySelectorAll('.cdk-overlay-pane');
      expect(overlayPanes.length).toBe(1);
    }));

    it('should render content inside popover', fakeAsync(() => {
      component.open();
      tick();
      
      const overlayElement = overlayContainer.getContainerElement();
      const content = overlayElement.querySelector('.test-content');
      expect(content?.textContent?.trim()).toBe('Test Content');
    }));

    it('should apply correct CSS classes', fakeAsync(() => {
      component.open();
      tick();
      
      const overlayPane = overlayContainer.getContainerElement().querySelector('.cdk-overlay-pane');
      expect(overlayPane).toHaveClass('popover-panel');
    }));
  });

  describe('Placement Functionality', () => {
    ['bottom', 'top', 'left', 'right'].forEach(placement => {
      it(`should support ${placement} placement`, fakeAsync(() => {
        hostComponent.placement = placement as PopoverPlacement;
        fixture.detectChanges();
        
        expect(component.placement).toBe(placement);
        
        component.open();
        tick();
        
        const popoverContent = overlayContainer.getContainerElement().querySelector('.popover-content');
        expect(popoverContent?.getAttribute('data-placement')).toBe(placement);
      }));
    });

    it('should default to bottom placement', () => {
      expect(component.placement).toBe('bottom');
      expect(component.actualPlacement).toBe('bottom');
    });
  });

  describe('Position Calculation', () => {
    it('should generate correct positions for bottom placement', () => {
      component.placement = 'bottom';
      const positions = (component as any).getPositions();
      
      expect(positions.length).toBeGreaterThan(0);
      expect(positions[0]).toEqual(jasmine.objectContaining({
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 8
      }));
    });

    it('should generate correct positions for top placement', () => {
      component.placement = 'top';
      const positions = (component as any).getPositions();
      
      expect(positions[0]).toEqual(jasmine.objectContaining({
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -8
      }));
    });

    it('should include fallback positions', () => {
      const positions = (component as any).getPositions();
      
      expect(positions.length).toBeGreaterThan(1);
    });
  });

  describe('Component Cleanup', () => {
    it('should dispose overlay on destroy', fakeAsync(() => {
      component.open();
      tick();
      
      const overlayRef = (component as any).overlayRef;
      spyOn(overlayRef, 'dispose');
      
      component.ngOnDestroy();
      
      expect(overlayRef.dispose).toHaveBeenCalled();
    }));

    it('should handle destroy when no overlay exists', () => {
      expect(() => {
        component.ngOnDestroy();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should not open if already open', fakeAsync(() => {
      component.open();
      tick();
      expect(component.isOpen).toBe(true);
      
      const initialOpenChangeCount = hostComponent.openChangeCount;
      component.open();
      tick();
      
      expect(hostComponent.openChangeCount).toBe(initialOpenChangeCount);
    }));

    it('should not close if already closed', fakeAsync(() => {
      expect(component.isOpen).toBe(false);
      
      component.close();
      tick();
      
      expect(component.isOpen).toBe(false);
      expect(hostComponent.openChangeCount).toBe(0);
    }));
  });
});
