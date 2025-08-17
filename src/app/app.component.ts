import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TestExampleComponent } from '../test-example/test-example.component';
import { DocumentViewerComponent, FileType } from '../document-viewer/document-viewer.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  imports: [CommonModule, TestExampleComponent, DocumentViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fun';

  // Document viewer demo data
  sampleImageUrl = 'https://picsum.photos/536/354';
  samplePdfUrl = 'https://www.princexml.com/samples/newsletter/drylab.pdf';
  sampleExcelBlob: Blob;

  constructor() {
    this.sampleExcelBlob = this.createSampleExcelBlob();
  }

  private createSampleExcelBlob(): Blob {
    // Create a workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Sales Data
    const salesData = [
      ['Product', 'Q1 Sales', 'Q2 Sales', 'Q3 Sales', 'Q4 Sales', 'Total'],
      ['Laptops', 1200, 1350, 1100, 1450, 5100],
      ['Tablets', 800, 950, 750, 1200, 3700],
      ['Phones', 2200, 2400, 2100, 2800, 9500],
      ['Accessories', 450, 520, 380, 640, 1990]
    ];
    const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Data');
    
    // Sheet 2: Employee List
    const employeeData = [
      ['ID', 'Name', 'Department', 'Salary', 'Start Date'],
      [1001, 'John Smith', 'Engineering', 75000, '2022-01-15'],
      [1002, 'Jane Doe', 'Marketing', 65000, '2021-11-20'],
      [1003, 'Bob Johnson', 'Sales', 55000, '2023-03-10'],
      [1004, 'Alice Brown', 'HR', 60000, '2020-09-05'],
      [1005, 'Charlie Wilson', 'Engineering', 80000, '2022-07-22']
    ];
    const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData);
    XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Employee List');
    
    // Sheet 3: Financial Summary
    const financialData = [
      ['Category', 'January', 'February', 'March', 'April', 'May'],
      ['Revenue', 125000, 132000, 128000, 145000, 138000],
      ['Expenses', 85000, 88000, 82000, 95000, 91000],
      ['Profit', 40000, 44000, 46000, 50000, 47000],
      ['Growth %', 5.2, 6.8, 4.1, 8.7, 6.3]
    ];
    const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
    XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financial Summary');

    // Convert to binary and create blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  onDocumentLoadError(error: string) {
    console.error('Document load error:', error);
    alert('Failed to load document: ' + error);
  }
}
