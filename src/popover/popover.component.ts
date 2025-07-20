import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, Overlay, OverlayRef, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';

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
  
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('popoverTemplate', { static: true }) popoverTemplate!: TemplateRef<any>;

  private overlayRef?: OverlayRef;

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
    
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(element)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: this.offsetX,
          offsetY: this.offsetY
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetX: this.offsetX,
          offsetY: -this.offsetY
        }
      ])
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
  }

  ngOnDestroy() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
}
