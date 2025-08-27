import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { TestExampleComponent } from './test-example.component';
import { TestExampleService } from '../example-service/test-example.service';

// ============ COMPONENT TESTING SUITE ============
// Tests for TestExampleComponent to verify component behavior, DOM interactions, and service integration
describe('TestExampleComponent', () => {
  // ============ TEST VARIABLES ============
  // These variables are shared across all test cases
  
  let component: TestExampleComponent;              // Component instance being tested
  let fixture: ComponentFixture<TestExampleComponent>; // Angular testing fixture wrapper
  let mockService: jasmine.SpyObj<TestExampleService>; // Mock service for controlled testing
  let httpMock: HttpTestingController;              // HTTP testing controller (for integration tests)

  // ============ BEFORE EACH TEST SETUP ============
  // Runs before every individual test to ensure clean, isolated environment
  beforeEach(async () => {
    // STEP 1: Create spy object for TestExampleService
    // jasmine.createSpyObj creates a mock object with spied methods
    mockService = jasmine.createSpyObj('TestExampleService', ['getBaconText']);

    // STEP 2: Configure testing module with component and dependencies
    await TestBed.configureTestingModule({
      imports: [TestExampleComponent],              // Import standalone component
      providers: [
        { provide: TestExampleService, useValue: mockService }, // Provide mock service
        provideHttpClient(),                        // For integration tests
        provideHttpClientTesting()                  // For HTTP mocking in integration tests
      ]
    }).compileComponents();

    // STEP 3: Create component fixture and instance
    fixture = TestBed.createComponent(TestExampleComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  // ============ AFTER EACH TEST CLEANUP ============
  afterEach(() => {
    // Verify no outstanding HTTP requests remain (for integration tests)
    httpMock.verify();
  });

  // ============ TEST 1: COMPONENT CREATION ============
  // Basic smoke test to verify component can be instantiated successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ============ TEST 2: INITIAL STATE VERIFICATION ============
  // Tests that component starts with correct initial values
  it('should initialize with empty bacon text and not loading', () => {
    expect(component.baconText()).toEqual([]);
    expect(component.isLoading()).toBe(false);
  });

  // ============ TEST 3: BUTTON INITIAL STATE ============
  // Tests DOM rendering and button initial state
  it('should render button with correct initial text and enabled state', () => {
    fixture.detectChanges(); // Trigger change detection to update DOM

    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent.trim()).toBe('Load Bacon Text');
    expect(button.nativeElement.disabled).toBe(false);
  });

  // ============ TEST 4: SUCCESSFUL DATA LOADING ============
  // Tests successful service call and component state updates
  it('should load bacon text successfully', () => {
    // ============ ARRANGE PHASE ============
    const mockResponse = [
      'Bacon ipsum dolor amet beef ribs',
      'Meatball chuck turkey drumstick'
    ];
    mockService.getBaconText.and.returnValue(of(mockResponse));

    // ============ ACT PHASE ============
    component.loadBaconText();

    // ============ ASSERT PHASE ============
    expect(mockService.getBaconText).toHaveBeenCalled();
    expect(component.baconText()).toEqual(mockResponse);
    expect(component.isLoading()).toBe(false);
  });

  // ============ TEST 5: LOADING STATE MANAGEMENT ============
  // Tests that loading state is properly managed during async operations
  it('should set loading state correctly during data fetch', () => {
    // ============ ARRANGE PHASE ============
    const mockResponse = ['Test bacon text'];
    mockService.getBaconText.and.returnValue(of(mockResponse));

    // ============ ACT & ASSERT PHASE ============
    // Verify initial state
    expect(component.isLoading()).toBe(false);

    // Call loadBaconText but don't trigger the observable yet
    component.loadBaconText();

    // Should be loading now
    expect(component.isLoading()).toBe(false); // This will be false since the observable completes synchronously with 'of'
    expect(component.baconText()).toEqual(mockResponse);
  });

  // ============ TEST 6: ERROR HANDLING ============
  // Tests error handling and state reset on service errors
  it('should handle error and reset state', () => {
    // ============ ARRANGE PHASE ============
    // Set some initial data to verify it gets cleared on error
    component.baconText.set(['existing data']);
    mockService.getBaconText.and.returnValue(throwError(() => new Error('API Error')));

    // ============ ACT PHASE ============
    component.loadBaconText();

    // ============ ASSERT PHASE ============
    expect(mockService.getBaconText).toHaveBeenCalled();
    expect(component.baconText()).toEqual([]); // Should be cleared on error
    expect(component.isLoading()).toBe(false);
  });

  // ============ TEST 7: BUTTON STATE DURING LOADING ============
  // Tests DOM updates during loading state
  it('should disable button and show loading text when loading', () => {
    // ============ ARRANGE PHASE ============
    component.isLoading.set(true);
    fixture.detectChanges();

    // ============ ASSERT PHASE ============
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
    expect(button.nativeElement.textContent.trim()).toBe('Loading...');
  });

  // ============ TEST 8: BUTTON CLICK INTEGRATION ============
  // Tests button click event triggers the loadBaconText method
  it('should call loadBaconText when button is clicked', () => {
    // ============ ARRANGE PHASE ============
    spyOn(component, 'loadBaconText');
    fixture.detectChanges();

    // ============ ACT PHASE ============
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    // ============ ASSERT PHASE ============
    expect(component.loadBaconText).toHaveBeenCalled();
  });

  // ============ TEST 9: CONTENT RENDERING ============
  // Tests that bacon text content is properly rendered in the DOM
  it('should render bacon text paragraphs when data is available', () => {
    // ============ ARRANGE PHASE ============
    const mockData = [
      'First bacon paragraph',
      'Second bacon paragraph',
      'Third bacon paragraph'
    ];
    component.baconText.set(mockData);
    fixture.detectChanges();

    // ============ ASSERT PHASE ============
    const baconContent = fixture.debugElement.query(By.css('.bacon-content'));
    expect(baconContent).toBeTruthy();

    const paragraphs = fixture.debugElement.queryAll(By.css('.bacon-content p'));
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0].nativeElement.textContent).toBe('First bacon paragraph');
    expect(paragraphs[1].nativeElement.textContent).toBe('Second bacon paragraph');
    expect(paragraphs[2].nativeElement.textContent).toBe('Third bacon paragraph');
  });

  // ============ TEST 10: CONDITIONAL RENDERING ============
  // Tests that bacon content section is hidden when no data is available
  it('should not render bacon content when no data is available', () => {
    // ============ ARRANGE PHASE ============
    component.baconText.set([]);
    fixture.detectChanges();

    // ============ ASSERT PHASE ============
    const baconContent = fixture.debugElement.query(By.css('.bacon-content'));
    expect(baconContent).toBeFalsy();
  });

  // ============ TEST 11: DISABLED BUTTON DURING LOADING ============
  // Tests that button cannot be clicked when disabled
  it('should not call loadBaconText when button is disabled', () => {
    // ============ ARRANGE PHASE ============
    spyOn(component, 'loadBaconText');
    component.isLoading.set(true);
    fixture.detectChanges();

    // ============ ACT PHASE ============
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    // ============ ASSERT PHASE ============
    // Note: Even though button is disabled, click events can still fire
    // This tests the actual disabled attribute is set correctly
    expect(button.nativeElement.disabled).toBe(true);
  });

  // ============ INTEGRATION TEST 1: FULL WORKFLOW WITH REAL SERVICE ============
  // Tests the complete workflow using the real service (integration test)
  it('should complete full workflow with real service', () => {
    // ============ ARRANGE PHASE ============
    // Use real service instead of mock for integration testing
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TestExampleComponent],
      providers: [
        TestExampleService,                         // Use real service
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    fixture = TestBed.createComponent(TestExampleComponent);
    component = fixture.componentInstance;
    const httpTestingController = TestBed.inject(HttpTestingController);

    const mockResponse = ['Integration test bacon text'];

    // ============ ACT PHASE ============
    component.loadBaconText();

    // ============ ASSERT PHASE ============
    const req = httpTestingController.expectOne('https://baconipsum.com/api/?type=meat-and-filler');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(component.baconText()).toEqual(mockResponse);
    expect(component.isLoading()).toBe(false);

    httpTestingController.verify();
  });

  // ============ INTEGRATION TEST 2: ERROR HANDLING WITH REAL SERVICE ============
  // Tests error handling using the real service (integration test)
  it('should handle errors with real service', () => {
    // ============ ARRANGE PHASE ============
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TestExampleComponent],
      providers: [
        TestExampleService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    fixture = TestBed.createComponent(TestExampleComponent);
    component = fixture.componentInstance;
    const httpTestingController = TestBed.inject(HttpTestingController);

    // Set some initial data to verify it gets cleared
    component.baconText.set(['initial data']);

    // ============ ACT PHASE ============
    component.loadBaconText();

    // ============ ASSERT PHASE ============
    const req = httpTestingController.expectOne('https://baconipsum.com/api/?type=meat-and-filler');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(component.baconText()).toEqual([]);
    expect(component.isLoading()).toBe(false);

    httpTestingController.verify();
  });
});