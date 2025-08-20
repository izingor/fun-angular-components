import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { TestExampleService } from '../example-service/test-example.service';
import { TestExampleComponent } from './test-example.component';

describe('TestExampleComponent', () => {
  // ============ TEST SETUP VARIABLES ============
  // These variables will be used across all test cases to maintain consistency
  
  let component: TestExampleComponent;         // Instance of the component being tested
  let fixture: ComponentFixture<TestExampleComponent>; // Angular test utility wrapper
  let service: jasmine.SpyObj<TestExampleService>;     // Mock service with spy methods

  // ============ BEFORE EACH TEST SETUP ============
  // This runs before every individual test to ensure clean, isolated state
  beforeEach(async () => {
    // STEP 1: Create service spy object
    // jasmine.createSpyObj creates a mock object with specified method names
    // This replaces the real service with a controllable mock for testing
    const serviceSpy = jasmine.createSpyObj('TestExampleService', [
      'getBaconText',  // Mock the getBaconText method that returns Observable<string[]>
    ]);

    // STEP 2: Configure the testing module
    // TestBed.configureTestingModule sets up the testing environment
    // Similar to @NgModule but specifically for test isolation
    await TestBed.configureTestingModule({
      imports: [TestExampleComponent],  // Import the standalone component to test
      providers: [
        provideHttpClient(),          // Provide HTTP client for dependency injection
        provideHttpClientTesting(),   // Provide HTTP testing utilities (HttpTestingController)
        { provide: TestExampleService, useValue: serviceSpy }, // Replace real service with spy
      ],
    }).compileComponents(); // Compile the component and its template

    // STEP 3: Create component fixture and get instances
    fixture = TestBed.createComponent(TestExampleComponent); // Create component wrapper
    component = fixture.componentInstance;  // Get the actual component instance
    service = TestBed.inject(                // Inject the mocked service from TestBed
      TestExampleService
    ) as jasmine.SpyObj<TestExampleService>; // Cast to spy type for IntelliSense
  });

  // ============ TEST 1: COMPONENT CREATION ============
  // Basic smoke test to verify the component can be instantiated successfully
  it('should create component', () => {
    // STEP 1: Assert component existence
    // toBeTruthy() verifies the component is not null, undefined, or falsy
    // This ensures the component was created without any constructor errors
    expect(component).toBeTruthy();
  });

  // ============ TEST 2: INITIAL STATE VERIFICATION ============
  // Tests that the component starts with correct default values
  it('Should init with correct default value', () => {
    // STEP 1: Verify initial data state
    // baconText() calls the signal getter to retrieve current value
    // Component should start with empty array (no data loaded yet)
    expect(component.baconText()).toEqual([]);
    
    // STEP 2: Verify initial loading state
    // isLoading() signal should start as false (not loading initially)
    // toBe() performs strict equality check (===) for primitive values
    expect(component.isLoading()).toEqual(false);
  });

  // ============ TEST 3: DOM RENDERING - BUTTON DISPLAY ============
  // Verifies that the load button is properly rendered in the template
  it('Should display load button', () => {
    // STEP 1: Trigger change detection
    // fixture.detectChanges() runs Angular's change detection cycle
    // This updates the DOM based on current component state
    fixture.detectChanges();
    
    // STEP 2: Query for button element
    // querySelector() finds the first button element in component's DOM
    // fixture.nativeElement provides access to the actual DOM structure
    const button = fixture.nativeElement.querySelector('button');
    
    // STEP 3: Verify button exists
    // toBeTruthy() ensures the button element was found and is not null
    expect(button).toBeTruthy();
    
    // STEP 4: Verify button text content
    // textContent.trim() gets button text and removes surrounding whitespace
    // This confirms the button displays the expected initial text
    expect(button.textContent.trim()).toBe('Load Bacon Text');
  });


  // ============ TEST 4: COMPLETE ASYNC FLOW WITH DOM VERIFICATION ============
  // Comprehensive test demonstrating async request lifecycle and DOM updates
  it('Should update DOM after fetched data arrives', () => {
    
    // ============ ARRANGE PHASE ============
    // Set up controlled test environment for async operation
    
    // STEP 1: Create controlled observable using Subject
    // Subject allows manual control over when the observable emits data
    // This is crucial for testing loading states and timing
    const dataSubject = new Subject<string[]>()
    
    // STEP 2: Define mock response data
    // This simulates what a real API would return
    const mockData = ['Mock data', 'more data']
    
    // STEP 3: Get button reference for potential interaction testing
    // Although not used in this test, shows how to access DOM elements
    const button = fixture.nativeElement.querySelector('button')

    // STEP 4: Configure service spy behavior
    // and.returnValue() tells the spy what to return when called
    // asObservable() converts Subject to Observable for service interface
    service.getBaconText.and.returnValue(dataSubject.asObservable())

    // ============ INITIAL STATE VERIFICATION ============
    // Confirm component starts in expected clean state
    
    // STEP 5: Verify initial loading state
    // Component should not be loading before any request is made
    expect(component.isLoading()).toBe(false)
    
    // STEP 6: Verify initial data state
    // Component should start with empty data array
    expect(component.baconText()).toEqual([])
    

    // ============ ACT PHASE - TRIGGER ASYNC REQUEST ============
    // Start the async operation and test immediate state changes
    
    // STEP 7: Initiate async request
    // loadBaconText() simulates user clicking the load button
    // This should immediately set loading to true and call the service
    component.loadBaconText()

    // ============ DURING REQUEST STATE VERIFICATION ============
    // Test component behavior while request is in progress
    
    // STEP 8: Verify loading state during request
    // Loading should be true while waiting for response
    expect(component.isLoading()).toBe(true)
    
    // STEP 9: Verify data remains empty during request
    // Data should not change until request completes
    expect(component.baconText()).toEqual([])

    // ============ COMPLETE ASYNC OPERATION ============
    // Simulate successful API response
    
    // STEP 10: Emit mock data through Subject
    // next() simulates the HTTP response arriving with data
    dataSubject.next(mockData)
    
    // STEP 11: Complete the observable
    // complete() simulates the HTTP request finishing successfully
    dataSubject.complete()

    // ============ POST-REQUEST STATE VERIFICATION ============
    // Verify component state after async operation completes
    
    // STEP 12: Verify loading state reset
    // Loading should return to false after request completes
    expect(component.isLoading()).toBe(false)
    
    // STEP 13: Verify data population
    // Component should now contain the fetched mock data
    expect(component.baconText()).toEqual(mockData)

    // ============ DOM UPDATE AND VERIFICATION ============
    // Test that component state changes are reflected in the template
    
    // STEP 14: Trigger change detection
    // detectChanges() updates the DOM to reflect new component state
    // This is necessary because Subject emission happens outside Angular's zone
    fixture.detectChanges()
    
    // STEP 15: Query for rendered paragraphs
    // querySelectorAll() finds all paragraph elements in the bacon-content container
    // These should be rendered based on the fetched data
    const paragraphs = fixture.nativeElement.querySelectorAll('.bacon-content p')
    
    // STEP 16: Verify correct number of elements
    // Should match the length of our mock data array (2 items)
    expect(paragraphs.length).toBe(2)
    
    // STEP 17: Verify first paragraph content
    // First paragraph should display the first item from mock data
    expect(paragraphs[0].textContent.trim()).toBe(mockData[0]) // 'Mock data'
    
    // STEP 18: Verify second paragraph content
    // Second paragraph should display the second item from mock data
    expect(paragraphs[1].textContent.trim()).toBe(mockData[1]) // 'more data'

  })
});
