# Document Viewer Component

A reusable Angular component for displaying and interacting with various document types including PDFs, images, and Office documents.

## Features

✅ **Multi-format Support**
- Images (JPG, PNG, GIF, BMP, WebP)
- PDF documents with full page navigation
- Office documents (Word, Excel) with download fallback

✅ **Interactive Toolbar**
- Download button
- Print functionality
- Rotate left/right (90° increments)
- Zoom in/out/reset
- Page navigation for PDFs
- File name display

✅ **PDF Navigation**
- Next/previous page navigation
- Direct page jumping
- Current page indicator with total pages
- Multi-page document support

✅ **Image Manipulation**
- CSS-based rotation
- Zoom controls
- Responsive scaling

✅ **Responsive Design**
- Mobile-friendly interface
- Adaptive toolbar layout
- Container-based sizing

## Installation

1. Install the component dependencies:
```bash
npm install @angular/material @angular/cdk pdfjs-dist@3.11.174
```

2. Import Angular Material modules in your app (if not already done):
```typescript
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
```

## Usage

### Basic Usage

```html
<app-document-viewer
  [src]="documentUrl"
  fileName="example.pdf"
  fileType="pdf"
  height="600px"
  (loadError)="onLoadError($event)">
</app-document-viewer>
```

### With Custom Configuration

```html
<app-document-viewer
  [src]="imageBlob"
  fileName="image.jpg"
  fileType="image"
  height="400px"
  [showToolbar]="true"
  [readonly]="false"
  [startPage]="1"
  [rotate]="90"
  (loadError)="handleError($event)">
</app-document-viewer>
```

## API Reference

### Inputs (@Input())

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `src` | `string \| Blob` | *Required* | Document source URL or Blob object |
| `fileName` | `string` | `'document'` | File name for display and download |
| `fileType` | `'image' \| 'pdf' \| 'word' \| 'excel'` | *Auto-detected* | Document type |
| `height` | `string` | `'600px'` | Component height (CSS value) |
| `showToolbar` | `boolean` | `true` | Whether to show the toolbar |
| `readonly` | `boolean` | `false` | Read-only mode (future enhancement) |
| `startPage` | `number` | `1` | Starting page for PDFs |
| `rotate` | `number` | `0` | Initial rotation (0, 90, 180, 270) |

### Outputs (@Output())

| Event | Type | Description |
|-------|------|-------------|
| `loadError` | `EventEmitter<string>` | Emitted when document loading fails |

### Supported File Types

- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`
- **PDF**: `.pdf`
- **Word**: `.doc`, `.docx`
- **Excel**: `.xls`, `.xlsx`

## Component Methods

### Navigation (PDF only)
- `nextPage()` - Navigate to next page
- `previousPage()` - Navigate to previous page
- `goToPage(page: number)` - Jump to specific page

### Rotation
- `rotateLeft()` - Rotate 90° counterclockwise
- `rotateRight()` - Rotate 90° clockwise

### Zoom
- `zoomIn()` - Increase zoom level
- `zoomOut()` - Decrease zoom level
- `resetZoom()` - Reset to 100% zoom

### Utilities
- `download()` - Download the document
- `print()` - Print the document

## Examples

### Loading from URL
```typescript
export class MyComponent {
  documentUrl = 'https://example.com/document.pdf';
  
  onDocumentError(error: string) {
    console.error('Document loading failed:', error);
  }
}
```

### Loading from File Input
```typescript
export class MyComponent {
  selectedFile: File | null = null;
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }
}
```

```html
<input type="file" (change)="onFileSelected($event)" accept=".pdf,.jpg,.png">

<app-document-viewer
  *ngIf="selectedFile"
  [src]="selectedFile"
  [fileName]="selectedFile.name"
  height="500px">
</app-document-viewer>
```

### Handling Different Document Types
```typescript
export class DocumentLibrary {
  documents = [
    {
      name: 'Report.pdf',
      url: '/assets/documents/report.pdf',
      type: 'pdf' as const
    },
    {
      name: 'Chart.png',
      url: '/assets/images/chart.png',
      type: 'image' as const
    },
    {
      name: 'Spreadsheet.xlsx',
      url: '/assets/documents/data.xlsx',
      type: 'excel' as const
    }
  ];
  
  selectedDocument = this.documents[0];
}
```

```html
<div class="document-selector">
  <select [(ngModel)]="selectedDocument">
    <option *ngFor="let doc of documents" [ngValue]="doc">
      {{ doc.name }}
    </option>
  </select>
</div>

<app-document-viewer
  [src]="selectedDocument.url"
  [fileName]="selectedDocument.name"
  [fileType]="selectedDocument.type"
  height="600px">
</app-document-viewer>
```

## Styling

The component uses Angular Material theming and can be customized via CSS custom properties:

```scss
app-document-viewer {
  --toolbar-background: #f5f5f5;
  --toolbar-text-color: #333;
  --document-background: #fff;
  --loading-spinner-color: #1976d2;
}
```

## Browser Support

- **PDF.js**: Loaded dynamically from CDN
- **Images**: Native browser support
- **Office Documents**: Download fallback (preview requires browser plugins)

## Dependencies

- Angular 15+
- Angular Material
- PDF.js (loaded dynamically)

## Error Handling

The component emits `loadError` events for various failure scenarios:
- Network errors when loading documents
- Unsupported file formats
- PDF.js loading failures
- Image loading errors

Always implement error handling in your parent component:

```typescript
onDocumentError(error: string) {
  // Log error
  console.error('Document viewer error:', error);
  
  // Show user-friendly message
  this.showErrorMessage('Failed to load document. Please try again.');
  
  // Optional: Fallback to download
  this.offerDownload();
}
```

## Performance Considerations

- PDF.js is loaded on-demand when first needed
- Large PDFs are rendered page-by-page
- Images are loaded natively by the browser
- Zoom and rotation operations are optimized for smooth performance

## Accessibility

- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus management for toolbar controls

## License

This component is part of the fun-angular-components library.
