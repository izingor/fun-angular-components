import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, Overlay, OverlayRef, OverlayPositionBuilder, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss'
})
export class PopoverComponent implements OnDestroy {
  @Input() trigger!: ElementRef<any> | HTMLElement;
  @Input() width?: string;
  @Input() maxWidth: string = '300px';
  @Input() offsetX: number = 0;
  @Input() offsetY: number = 8;
  @Input() isOpen: boolean = false;
  @Input() placement: PopoverPlacement = 'bottom';
  
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('popoverTemplate', { static: true }) popoverTemplate!: TemplateRef<any>;

  private overlayRef?: OverlayRef;
  public actualPlacement: PopoverPlacement = 'bottom';
  public pointerOffset: number = 0;

  constructor(
    private overlay: Overlay,
    private overlayPositionBuilder: OverlayPositionBuilder,
    private viewContainerRef: ViewContainerRef
  ) {}

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (!this.overlayRef && this.trigger) {
      this.createOverlay();
    }
    
    if (this.overlayRef && !this.isOpen) {
      const portal = new TemplatePortal(this.popoverTemplate, this.viewContainerRef);
      this.overlayRef.attach(portal);
      this.isOpen = true;
      this.openChange.emit(true);
      
      setTimeout(() => this.calculatePointerPosition(), 0);
    }
  }

  close() {
    if (this.overlayRef && this.isOpen) {
      this.overlayRef.detach();
      this.isOpen = false;
      this.openChange.emit(false);
    }
  }

  private createOverlay() {
    const element = this.trigger instanceof ElementRef ? this.trigger : new ElementRef(this.trigger);
    
    const positions = this.getPositions();
    
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(element)
      .withPositions(positions)
      .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'popover-panel',
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });

    positionStrategy.positionChanges.subscribe((position) => {
      this.updateActualPlacement(position);
    });
  }

  private getPositions(): ConnectedPosition[] {
    const offset = 8;
    
    const positions: ConnectedPosition[] = [];
    
    switch (this.placement) {
      case 'bottom':
        positions.push({
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetY: offset
        });
        break;
      case 'top':
        positions.push({
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -offset
        });
        break;
      case 'left':
        positions.push({
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -offset
        });
        break;
      case 'right':
        positions.push({
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: offset
        });
        break;
    }

    const fallbacks: ConnectedPosition[] = [
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: offset
      },
      // Top
      {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -offset
      },
      // Right
      {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        offsetX: offset
      },
      // Left
      {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
        offsetX: -offset
      }
    ];

    // Add fallbacks that are different from the primary position
    fallbacks.forEach(fallback => {
      if (!positions.some(pos => 
        pos.originX === fallback.originX && 
        pos.originY === fallback.originY &&
        pos.overlayX === fallback.overlayX &&
        pos.overlayY === fallback.overlayY
      )) {
        positions.push(fallback);
      }
    });

    return positions;
  }

  private updateActualPlacement(position: any) {
    // Determine actual placement based on the position that was used
    if (position.connectionPair.originY === 'bottom' && position.connectionPair.overlayY === 'top') {
      this.actualPlacement = 'bottom';
    } else if (position.connectionPair.originY === 'top' && position.connectionPair.overlayY === 'bottom') {
      this.actualPlacement = 'top';
    } else if (position.connectionPair.originX === 'end' && position.connectionPair.overlayX === 'start') {
      this.actualPlacement = 'right';
    } else if (position.connectionPair.originX === 'start' && position.connectionPair.overlayX === 'end') {
      this.actualPlacement = 'left';
    }
  }

  private calculatePointerPosition() {
    if (!this.overlayRef || !this.isOpen) return;

    const triggerElement = this.trigger instanceof ElementRef ? this.trigger.nativeElement : this.trigger;
    const overlayElement = this.overlayRef.overlayElement;
    const popoverContent = overlayElement.querySelector('.popover-content') as HTMLElement;

    if (!triggerElement || !popoverContent) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const popoverRect = popoverContent.getBoundingClientRect();

    let offset = 0;

    if (this.actualPlacement === 'bottom' || this.actualPlacement === 'top') {
      // Calculate horizontal offset for vertical placements
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const popoverLeft = popoverRect.left;
      offset = triggerCenter - popoverLeft;
      
      // Ensure the pointer stays within the popover bounds with some padding
      const minOffset = 16; // Minimum distance from edge
      const maxOffset = popoverRect.width - 16;
      offset = Math.max(minOffset, Math.min(maxOffset, offset));
      
    } else if (this.actualPlacement === 'left' || this.actualPlacement === 'right') {
      // Calculate vertical offset for horizontal placements
      const triggerCenter = triggerRect.top + triggerRect.height / 2;
      const popoverTop = popoverRect.top;
      offset = triggerCenter - popoverTop;
      
      // Ensure the pointer stays within the popover bounds with some padding
      const minOffset = 16;
      const maxOffset = popoverRect.height - 16;
      offset = Math.max(minOffset, Math.min(maxOffset, offset));
    }

    this.pointerOffset = offset;
  }

  ngOnDestroy() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
}
