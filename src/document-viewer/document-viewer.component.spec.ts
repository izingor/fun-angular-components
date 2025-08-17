import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DocumentViewerComponent } from './document-viewer.component';

// Mock global window.pdfjsLib
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

describe('DocumentViewerComponent', () => {
  let component: DocumentViewerComponent;
  let fixture: ComponentFixture<DocumentViewerComponent>;

  beforeEach(async () => {
    // Mock PDF.js
    window.pdfjsLib = {
      GlobalWorkerOptions: { workerSrc: '' },
      getDocument: jasmine.createSpy('getDocument').and.returnValue({
        promise: Promise.resolve({
          numPages: 5,
          getPage: jasmine.createSpy('getPage').and.returnValue(Promise.resolve({
            getViewport: jasmine.createSpy('getViewport').and.returnValue({ width: 800, height: 600 }),
            render: jasmine.createSpy('render').and.returnValue({ promise: Promise.resolve() })
          }))
        })
      })
    };

    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentViewerComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    component.src = 'test-image.jpg';
    component.fileType = 'image';
    component.fileName = 'test-image.jpg';
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.height).toBe('600px');
    expect(component.showToolbar).toBe(true);
    expect(component.readonly).toBe(false);
    expect(component.startPage).toBe(1);
    expect(component.rotate).toBe(0);
  });

  it('should determine file type correctly', () => {
    const fileType1 = component['determineFileType']('document.pdf');
    expect(fileType1).toBe('pdf');
    
    const fileType2 = component['determineFileType']('image.jpg');
    expect(fileType2).toBe('image');
    
    const fileType3 = component['determineFileType']('document.docx');
    expect(fileType3).toBe('word');
  });

  it('should handle rotation correctly', () => {
    component.rotateRight();
    expect(component.currentRotation).toBe(90);
    
    component.rotateRight();
    expect(component.currentRotation).toBe(180);
    
    component.rotateLeft();
    expect(component.currentRotation).toBe(90);
  });

  it('should handle zoom correctly', () => {
    const initialZoom = component.zoom;
    
    component.zoomIn();
    expect(component.zoom).toBeGreaterThan(initialZoom);
    
    component.zoomOut();
    expect(component.zoom).toBe(initialZoom);
    
    component.resetZoom();
    expect(component.zoom).toBe(1);
  });

  it('should navigate pages correctly for PDFs', () => {
    component.fileType = 'pdf';
    component.totalPages = 5;
    component.currentPage = 1;
    
    component.nextPage();
    expect(component.currentPage).toBe(2);
    
    component.previousPage();
    expect(component.currentPage).toBe(1);
    
    component.goToPage(5);
    expect(component.currentPage).toBe(5);
    
    // Should not go beyond bounds
    component.nextPage();
    expect(component.currentPage).toBe(5);
  });

  it('should emit loadError on image load error', () => {
    spyOn(component.loadError, 'emit');
    
    component.onImageError();
    
    expect(component.loadError.emit).toHaveBeenCalledWith('Failed to load image');
  });

  it('should generate correct image transform', () => {
    component.currentRotation = 90;
    component.zoom = 1.5;
    
    const transform = component.getImageTransform();
    expect(transform).toBe('rotate(90deg) scale(1.5)');
  });

  it('should check navigation availability correctly', () => {
    component.fileType = 'pdf';
    component.totalPages = 1;
    expect(component.canNavigate()).toBe(false);
    
    component.totalPages = 5;
    expect(component.canNavigate()).toBe(true);
    
    component.fileType = 'image';
    expect(component.canNavigate()).toBe(false);
  });
});
