import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TestExampleComponent } from '../test-example/test-example.component';
import { DocumentViewerComponent, FileType } from '../document-viewer/document-viewer.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, TestExampleComponent, DocumentViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fun';

  // Document viewer demo data
  sampleImageUrl = 'https://via.placeholder.com/800x600/4CAF50/white?text=Sample+Image';
  samplePdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  onDocumentLoadError(error: string) {
    console.error('Document load error:', error);
    alert('Failed to load document: ' + error);
  }
}
