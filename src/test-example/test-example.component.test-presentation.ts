import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TestExampleComponent } from "./test-example.component";
import { TestExampleService } from "../example-service/test-example.service";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { of, throwError } from "rxjs";

describe('TestExampleComponent', () => {
  // Test variables that will be used across all test cases
  let component: TestExampleComponent // Instance of the component being tested
  let fixture: ComponentFixture<TestExampleComponent> // Angular test utility that wraps the component
  let service: jasmine.SpyObj<TestExampleService> // Mock service with spy methods

  beforeEach(async () => {
    // beforeEach runs before each individual test case to ensure clean state
    
    // Create a spy object that mimics TestExampleService
    // jasmine.createSpyObj creates a mock object with spy methods
    // 'getBaconText' is the method we want to spy on/mock
    const serviceSpy = jasmine.createSpyObj('TestExampleService', ['getBaconText'])

    // Configure the testing module - similar to NgModule but for testing
    await TestBed.configureTestingModule({
      imports: [TestExampleComponent], // Import the standalone component
      providers: [
        provideHttpClient(), // Provide HTTP client for dependency injection
        provideHttpClientTesting(), // Provide HTTP testing utilities
        // Replace the real service with our spy object
        // This ensures we control the service behavior in tests
        { provide: TestExampleService, useValue: serviceSpy }
      ]
    }).compileComponents() // Compile the component and its template

    // Create a component fixture - a wrapper around component instance
    fixture = TestBed.createComponent(TestExampleComponent)
    // Get the actual component instance from the fixture
    component = fixture.componentInstance
    // Get the mocked service from the testing module's injector
    service = TestBed.inject(TestExampleService) as jasmine.SpyObj<TestExampleService>
  })

  // Test 1: Component Creation
  // This verifies that the component can be instantiated without errors
  it('Should create a component', () => {
    // expect() creates an assertion - toBeTruthy() checks if value is truthy
    // This ensures the component was successfully created and initialized
    expect(component).toBeTruthy()
  })

  // Test 2: Initial State
  // This verifies that the component starts with the correct default values
  it('Should initialize with correct default values', () => {
    // Test that baconText signal starts as empty array
    // component.baconText() calls the signal getter to get current value
    // toEqual() performs deep equality check for arrays/objects
    expect(component.baconText()).toEqual([])
    
    // Test that isLoading signal starts as false
    // toBe() performs strict equality check (===)
    expect(component.isLoading()).toBe(false)
  })

  // Test 3: DOM Rendering - Load Button
  // This verifies that the load button is rendered in the DOM
  it('Should display load button', () => {
    // fixture.detectChanges() triggers Angular change detection
    // This updates the DOM based on component state changes
    fixture.detectChanges()
    
    // querySelector() finds the first button element in the component's DOM
    // fixture.nativeElement gives access to the actual DOM element
    const button = fixture.nativeElement.querySelector('button')
    
    // Verify the button exists in the DOM
    expect(button).toBeTruthy()
    
    // textContent.trim() gets the button's text and removes whitespace
    // Check that button shows correct initial text
    expect(button.textContent.trim()).toBe('Load Bacon Text')
  })

  // Test 4: Button State When Not Loading
  // This verifies the button shows correct text and is enabled when not loading
  it('Should show "Load Bacon Text" and be enabled when not loading', () => {
    // Explicitly set the loading state to false using signal setter
    component.isLoading.set(false)
    
    // Trigger change detection to update DOM based on state change
    fixture.detectChanges()
    
    // Get button element from DOM
    const button = fixture.nativeElement.querySelector('button')
    
    // Verify button text matches expected non-loading state
    expect(button.textContent.trim()).toBe('Load Bacon Text')
    
    // disabled property should be false when not loading
    expect(button.disabled).toBe(false)
  })

  // Test 5: Button State When Loading
  // This verifies the button shows loading text and is disabled during loading
  it('Should show "Loading..." and be disabled when loading', () => {
    // Set loading state to true to simulate active loading
    component.isLoading.set(true)
    
    // Update DOM to reflect the loading state change
    fixture.detectChanges()
    
    const button = fixture.nativeElement.querySelector('button')
    
    // Verify button text changes to loading state
    expect(button.textContent.trim()).toBe('Loading...')
    
    // Button should be disabled during loading to prevent multiple requests
    expect(button.disabled).toBe(true)
  })

  // Test 6: Successful Data Loading
  // This verifies that clicking the button calls the service and handles successful response
  it('Should load bacon text successfully when button is clicked', () => {
    // Create mock data that simulates API response
    const mockData = ['First paragraph', 'Second paragraph', 'Third paragraph']
    
    // Configure the service spy to return mock data when called
    // and.returnValue() sets what the spy method should return
    // of() creates an Observable that immediately emits the mock data
    service.getBaconText.and.returnValue(of(mockData))

    // Get button element and simulate user click
    const button = fixture.nativeElement.querySelector('button')
    button.click() // Triggers the (click) event handler

    // Verify that the service method was called
    // toHaveBeenCalled() checks if the spy method was invoked
    expect(service.getBaconText).toHaveBeenCalled()
    
    // Verify that component state was updated with the mock data
    expect(component.baconText()).toEqual(mockData)
    
    // Verify that loading state was reset to false after completion
    expect(component.isLoading()).toBe(false)
  })

  // Test 7: Loading State Management
  // This verifies that the loading state is properly managed during the request
  it('Should set loading state correctly during request', () => {
    const mockData = ['Test paragraph']
    
    // Configure service to return observable with test data
    service.getBaconText.and.returnValue(of(mockData))

    // Check initial state - should not be loading
    expect(component.isLoading()).toBe(false)

    // Call the component method directly (simulates button click)
    component.loadBaconText()
    
    // After observable completes synchronously in tests:
    // - Loading should be false (reset after completion)
    // - Data should be populated
    expect(component.isLoading()).toBe(false)
    expect(component.baconText()).toEqual(mockData)
  })

  // Test 8: Error Handling
  // This verifies that errors are handled gracefully
  it('Should handle service error gracefully', () => {
    // Configure service spy to throw an error
    // throwError() creates an Observable that immediately emits an error
    service.getBaconText.and.returnValue(throwError(() => new Error('Service error')))

    // Call the method that should handle the error
    component.loadBaconText()

    // Verify service was called despite the error
    expect(service.getBaconText).toHaveBeenCalled()
    
    // Verify error handling: baconText should be reset to empty array
    expect(component.baconText()).toEqual([])
    
    // Verify loading state is reset even after error
    expect(component.isLoading()).toBe(false)
  })

  // Test 9: Content Display
  // This verifies that bacon text content is displayed when available
  it('Should display bacon text content when data is available', () => {
    // Set up test data by directly updating the component's signal
    const mockData = ['First paragraph', 'Second paragraph']
    component.baconText.set(mockData) // Use signal setter to update state
    
    // Trigger change detection to update DOM with new data
    fixture.detectChanges()

    // querySelectorAll() finds ALL elements matching the selector
    // This gets all paragraph elements within the bacon-content div
    const paragraphs = fixture.nativeElement.querySelectorAll('.bacon-content p')
    
    // Verify correct number of paragraphs are rendered
    expect(paragraphs.length).toBe(2)
    
    // Verify each paragraph contains the expected text content
    // [0] and [1] access specific elements from the NodeList
    expect(paragraphs[0].textContent.trim()).toBe('First paragraph')
    expect(paragraphs[1].textContent.trim()).toBe('Second paragraph')
  })

  // Test 10: No Content Display
  // This verifies that no content is shown when baconText is empty
  it('Should not display content area when no data is available', () => {
    // Explicitly set baconText to empty array (simulates initial state)
    component.baconText.set([])
    
    // Update DOM to reflect the empty state
    fixture.detectChanges()

    // Try to find the content area - should not exist when no data
    // querySelector() returns null if element is not found
    const contentArea = fixture.nativeElement.querySelector('.bacon-content')
    
    // toBeFalsy() checks that value is falsy (null, undefined, false, etc.)
    expect(contentArea).toBeFalsy()
  })

  // Test 11: Service Injection
  // This verifies that the service is properly injected
  it('Should inject TestExampleService', () => {
    // Access the service instance through the component
    // This verifies dependency injection is working correctly
    expect(component.testExampleService).toBeTruthy()
  })

  // Test 12: Button Click Event
  // This verifies that clicking the button triggers the loadBaconText method
  it('Should call loadBaconText when button is clicked', () => {
    // spyOn() creates a spy on an existing method
    // This allows us to track if the method was called without executing it
    spyOn(component, 'loadBaconText')
    
    // Get button and simulate click event
    const button = fixture.nativeElement.querySelector('button')
    button.click() // Triggers the Angular event binding (click)="loadBaconText()"

    // Verify that the component method was called when button was clicked
    // This ensures the event binding is working correctly
    expect(component.loadBaconText).toHaveBeenCalled()
  })
});


