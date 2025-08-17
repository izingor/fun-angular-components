import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

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
    MatTableModule,
    MatSelectModule,
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

  // Excel specific
  excelWorkbook: any = null;
  excelSheets: string[] = [];
  currentSheet: string = '';
  excelData: any[][] = [];
  displayedColumns: string[] = [];

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
    // Clean up Excel data
    this.excelWorkbook = null;
    this.excelSheets = [];
    this.excelData = [];
    this.displayedColumns = [];
  }

  private async loadPdfJs(): Promise<void> {
    if (this.pdfJsLoaded || window.pdfjsLib) {
      this.pdfJsLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      // Load PDF.js library
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          // Set worker source
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          this.pdfJsLoaded = true;
          console.log('PDF.js loaded successfully');
          resolve();
        } else {
          reject(new Error('PDF.js failed to load'));
        }
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
        case 'excel':
          await this.loadExcel();
          break;
        case 'word':
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
      console.log('Loading PDF.js library...');
      await this.loadPdfJs();
      
      console.log('Loading PDF document from:', this.documentUrl);
      const loadingTask = window.pdfjsLib.getDocument({
        url: this.documentUrl,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true
      });
      
      this.pdfDocument = await loadingTask.promise;
      this.totalPages = this.pdfDocument.numPages;
      this.currentPage = Math.min(this.startPage, this.totalPages);
      
      console.log(`PDF loaded successfully. Pages: ${this.totalPages}`);
      
      // Wait for next tick to ensure canvas is ready
      setTimeout(() => {
        this.renderPdfPage();
      }, 100);
      
    } catch (error) {
      console.error('PDF loading error:', error);
      this.loadError.emit(`Failed to load PDF: ${error}`);
    }
  }

  private async renderPdfPage() {
    if (!this.pdfDocument || !this.canvasRef?.nativeElement) return;

    try {
      // Cancel previous render task
      if (this.renderTask) {
        this.renderTask.cancel();
      }

      const page = await this.pdfDocument.getPage(this.currentPage);
      const canvas = this.canvasRef.nativeElement;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

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

  private async loadExcel() {
    try {
      let arrayBuffer: ArrayBuffer;
      
      if (this.src instanceof Blob) {
        arrayBuffer = await this.src.arrayBuffer();
      } else {
        // Fetch from URL
        const response = await fetch(this.documentUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        arrayBuffer = await response.arrayBuffer();
      }

      // Parse the Excel file
      this.excelWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
      this.excelSheets = this.excelWorkbook.SheetNames;
      this.totalPages = this.excelSheets.length;
      
      if (this.excelSheets.length > 0) {
        this.currentSheet = this.excelSheets[Math.min(this.startPage - 1, this.excelSheets.length - 1)];
        this.currentPage = Math.min(this.startPage, this.totalPages);
        this.loadExcelSheet(this.currentSheet);
      }
    } catch (error) {
      this.loadError.emit(`Failed to load Excel file: ${error}`);
    }
  }

  private loadExcelSheet(sheetName: string) {
    if (!this.excelWorkbook || !sheetName) return;

    try {
      const worksheet = this.excelWorkbook.Sheets[sheetName];
      if (!worksheet) {
        this.loadError.emit(`Sheet "${sheetName}" not found`);
        return;
      }

      // Convert sheet to JSON array
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        defval: '', 
        raw: false 
      }) as any[][];

      if (jsonData.length === 0) {
        this.excelData = [];
        this.displayedColumns = [];
        return;
      }

      // Use first row as headers if it contains strings, otherwise generate column names
      const firstRow = jsonData[0] || [];
      const hasHeaders = firstRow.some(cell => typeof cell === 'string' && cell.trim() !== '');
      
      if (hasHeaders && firstRow.every(cell => typeof cell === 'string' || cell === '')) {
        // First row contains headers
        this.displayedColumns = firstRow.map((header, index) => 
          header ? header.toString() : `Column ${index + 1}`
        );
        this.excelData = jsonData.slice(1);
      } else {
        // Generate column headers
        const maxCols = Math.max(...jsonData.map(row => row.length));
        this.displayedColumns = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);
        this.excelData = jsonData;
      }

      // Ensure all rows have the same number of columns
      this.excelData = this.excelData.map(row => {
        const newRow = [...row];
        while (newRow.length < this.displayedColumns.length) {
          newRow.push('');
        }
        return newRow.slice(0, this.displayedColumns.length);
      });

    } catch (error) {
      this.loadError.emit(`Failed to process Excel sheet: ${error}`);
    }
  }

  // Navigation methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      if (this.fileType === 'pdf') {
        this.renderPdfPage();
      } else if (this.fileType === 'excel' && this.excelSheets.length > 0) {
        this.currentSheet = this.excelSheets[page - 1];
        this.loadExcelSheet(this.currentSheet);
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

  // Excel-specific navigation
  goToSheet(sheetName: string) {
    const sheetIndex = this.excelSheets.indexOf(sheetName);
    if (sheetIndex !== -1) {
      this.currentSheet = sheetName;
      this.currentPage = sheetIndex + 1;
      this.loadExcelSheet(sheetName);
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
    return (this.fileType === 'pdf' && this.totalPages > 1) || 
           (this.fileType === 'excel' && this.excelSheets.length > 1);
  }

  // Helper method to get current sheet name for display
  getCurrentSheetName(): string {
    return this.currentSheet || '';
  }

  // Helper method to check if current document is Excel
  isExcel(): boolean {
    return this.fileType === 'excel';
  }
}
