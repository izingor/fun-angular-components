import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export type FileType = 'image' | 'pdf' | 'word' | 'excel';

// Global declaration for PDF.js
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

@Component({
  selector: 'app-document-viewer',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss'
})
export class DocumentViewerComponent implements OnInit, OnDestroy {
  @Input() src!: string | Blob;
  @Input() fileName: string = 'document';
  @Input() fileType!: FileType;
  @Input() height: string = '600px';
  @Input() showToolbar: boolean = true;
  @Input() readonly: boolean = false;
  @Input() startPage: number = 1;
  @Input() rotate: number = 0;

  @Output() loadError = new EventEmitter<string>();

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageElement', { static: false }) imageRef!: ElementRef<HTMLImageElement>;

  // Internal state
  currentPage: number = 1;
  totalPages: number = 1;
  currentRotation: number = 0;
  zoom: number = 1;
  isLoading: boolean = false;
  documentUrl: string = '';
  
  // PDF.js specific
  private pdfDocument: any = null;
  private renderTask: any = null;
  private pdfJsLoaded: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.currentPage = this.startPage;
    this.currentRotation = this.rotate;
    this.loadDocument();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private cleanup() {
    if (this.renderTask) {
      this.renderTask.cancel();
    }
    if (this.pdfDocument) {
      this.pdfDocument.destroy();
    }
    if (this.documentUrl && this.documentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.documentUrl);
    }
  }

  private async loadPdfJs(): Promise<void> {
    if (this.pdfJsLoaded || window.pdfjsLib) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Load PDF.js library
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        // Load PDF.js worker
        const workerScript = document.createElement('script');
        workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        workerScript.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            this.pdfJsLoaded = true;
            resolve();
          } else {
            reject(new Error('PDF.js failed to load'));
          }
        };
        workerScript.onerror = () => reject(new Error('PDF.js worker failed to load'));
        document.head.appendChild(workerScript);
      };
      script.onerror = () => reject(new Error('PDF.js library failed to load'));
      document.head.appendChild(script);
    });
  }

  private async loadDocument() {
    this.isLoading = true;
    
    try {
      // Create document URL
      if (this.src instanceof Blob) {
        this.documentUrl = URL.createObjectURL(this.src);
      } else {
        this.documentUrl = this.src;
      }

      // Determine file type if not provided
      if (!this.fileType) {
        this.fileType = this.determineFileType(this.fileName);
      }

      switch (this.fileType) {
        case 'pdf':
          await this.loadPdf();
          break;
        case 'image':
          this.loadImage();
          break;
        case 'word':
        case 'excel':
          this.loadOfficeDocument();
          break;
        default:
          this.loadError.emit('Unsupported file type');
      }
    } catch (error) {
      this.loadError.emit(`Failed to load document: ${error}`);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private determineFileType(fileName: string): FileType {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return 'image';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      default:
        return 'image';
    }
  }

  private async loadPdf() {
    try {
      await this.loadPdfJs();
      const loadingTask = window.pdfjsLib.getDocument(this.documentUrl);
      this.pdfDocument = await loadingTask.promise;
      this.totalPages = this.pdfDocument.numPages;
      this.currentPage = Math.min(this.startPage, this.totalPages);
      await this.renderPdfPage();
    } catch (error) {
      this.loadError.emit(`Failed to load PDF: ${error}`);
    }
  }

  private async renderPdfPage() {
    if (!this.pdfDocument || !this.canvasRef) return;

    try {
      // Cancel previous render task
      if (this.renderTask) {
        this.renderTask.cancel();
      }

      const page = await this.pdfDocument.getPage(this.currentPage);
      const canvas = this.canvasRef.nativeElement;
      const context = canvas.getContext('2d');

      // Calculate scale based on container width
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1, rotation: this.currentRotation });
      const scale = (containerWidth * 0.9 * this.zoom) / viewport.width;
      const scaledViewport = page.getViewport({ scale, rotation: this.currentRotation });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      this.renderTask = page.render(renderContext);
      await this.renderTask.promise;
      this.renderTask = null;
    } catch (error) {
      if (error instanceof Error && error.name !== 'RenderingCancelledException') {
        this.loadError.emit(`Failed to render PDF page: ${error}`);
      }
    }
  }

  private loadImage() {
    // Image loading is handled in the template
    this.totalPages = 1;
    this.currentPage = 1;
  }

  private loadOfficeDocument() {
    // For Office documents, we'll show an embedded viewer or download option
    this.totalPages = 1;
    this.currentPage = 1;
  }

  // Navigation methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      if (this.fileType === 'pdf') {
        this.renderPdfPage();
      }
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Rotation methods
  rotateLeft() {
    this.currentRotation = (this.currentRotation - 90 + 360) % 360;
    if (this.fileType === 'pdf') {
      this.renderPdfPage();
    }
  }

  rotateRight() {
    this.currentRotation = (this.currentRotation + 90) % 360;
    if (this.fileType === 'pdf') {
      this.renderPdfPage();
    }
  }

  // Zoom methods
  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.2, 3);
    if (this.fileType === 'pdf') {
      this.renderPdfPage();
    }
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.2, 0.5);
    if (this.fileType === 'pdf') {
      this.renderPdfPage();
    }
  }

  resetZoom() {
    this.zoom = 1;
    if (this.fileType === 'pdf') {
      this.renderPdfPage();
    }
  }

  // Utility methods
  download() {
    const link = document.createElement('a');
    link.href = this.documentUrl;
    link.download = this.fileName;
    link.click();
  }

  print() {
    if (this.fileType === 'pdf') {
      // For PDFs, open in new window and print
      const printWindow = window.open(this.documentUrl);
      printWindow?.addEventListener('load', () => {
        printWindow.print();
      });
    } else {
      // For images, print current view
      const printWindow = window.open('');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print ${this.fileName}</title></head>
            <body>
              <img src="${this.documentUrl}" style="max-width: 100%; height: auto; transform: rotate(${this.currentRotation}deg);" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }

  onImageLoad() {
    // Image loaded successfully
  }

  onImageError() {
    this.loadError.emit('Failed to load image');
  }

  getImageTransform(): string {
    return `rotate(${this.currentRotation}deg) scale(${this.zoom})`;
  }

  canNavigate(): boolean {
    return this.fileType === 'pdf' && this.totalPages > 1;
  }
}
