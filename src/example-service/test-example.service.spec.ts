import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { TestExampleService } from './test-example.service';

// ============ SERVICE TESTING SUITE ============
// Tests for TestExampleService to verify HTTP interactions and data handling
describe('TestExampleService', () => {
  // ============ TEST VARIABLES ============
  // These variables are shared across all test cases
  
  let service: TestExampleService;        // Instance of service being tested
  let httpMock: HttpTestingController;    // Mock HTTP controller for intercepting requests

  // ============ BEFORE EACH TEST SETUP ============
  // Runs before every individual test to ensure clean, isolated environment
  beforeEach(() => {
    // STEP 1: Configure testing module with HTTP testing utilities
    // TestBed.configureTestingModule sets up the dependency injection container
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),        // Provide real HTTP client functionality
        provideHttpClientTesting()  // Provide HTTP testing tools (HttpTestingController)
      ]
    });
    
    // STEP 2: Inject service instance from TestBed
    // TestBed.inject() retrieves the service from the configured DI container
    service = TestBed.inject(TestExampleService);
    
    // STEP 3: Inject HTTP testing controller
    // HttpTestingController allows us to mock and verify HTTP requests
    httpMock = TestBed.inject(HttpTestingController);
  });

  // ============ AFTER EACH TEST CLEANUP ============
  // Runs after every test to ensure no unmatched HTTP requests remain
  afterEach(() => {
    // STEP 1: Verify no outstanding HTTP requests
    // httpMock.verify() fails the test if any expected HTTP calls weren't made
    // This prevents false positives and ensures all mocked requests are handled
    httpMock.verify();
  });

  // ============ TEST 1: SERVICE CREATION ============
  // Basic smoke test to verify service can be instantiated successfully
  it('should be created', () => {
    // STEP 1: Assert service existence
    // toBeTruthy() verifies the service was injected and is not null/undefined
    // This ensures dependency injection is working correctly
    expect(service).toBeTruthy();
  });

  // ============ TEST 2: SUCCESSFUL API CALL ============
  // Tests the happy path - successful HTTP request with valid response
  it('should fetch bacon text from API', () => {
    // ============ ARRANGE PHASE ============
    // STEP 1: Create mock response data
    // This simulates what the real API would return
    const mockResponse = [
      'Bacon ipsum dolor amet beef ribs pork chop',
      'Meatball chuck turkey drumstick'
    ];

    // ============ ACT & ASSERT PHASE ============
    // STEP 2: Call service method and set up response expectations
    // subscribe() allows us to test the Observable's emitted values
    service.getBaconText().subscribe((response: string[]) => {
      // STEP 3: Verify response data matches mock
      // toEqual() performs deep equality check for array contents
      expect(response).toEqual(mockResponse);
      
      // STEP 4: Verify response is an array
      // Array.isArray() ensures the response has the correct type
      expect(Array.isArray(response)).toBe(true);
      
      // STEP 5: Verify response length
      // This confirms we received the expected number of items
      expect(response.length).toBe(2);
    });

    // ============ HTTP MOCK VERIFICATION ============
    // STEP 6: Intercept and verify the HTTP request
    // expectOne() captures exactly one request to the specified URL
    const req = httpMock.expectOne('https://baconipsum.com/api/?type=meat-and-filler');
    
    // STEP 7: Verify HTTP method
    // Ensures the service uses the correct HTTP verb (GET)
    expect(req.request.method).toBe('GET');
    
    // STEP 8: Provide mock response
    // flush() simulates the server responding with our mock data
    // This triggers the Observable's next() callback with the mock response
    req.flush(mockResponse);
  });

  // ============ TEST 3: EMPTY RESPONSE HANDLING ============
  // Tests how service handles valid but empty API responses
  it('should handle empty response', () => {
    // ============ ACT & ASSERT PHASE ============
    // STEP 1: Subscribe to service method and test empty response
    service.getBaconText().subscribe((response: string[]) => {
      // STEP 2: Verify empty array is handled correctly
      // Service should return empty array, not null or undefined
      expect(response).toEqual([]);
    });

    // ============ HTTP MOCK SIMULATION ============
    // STEP 3: Intercept the HTTP request
    const req = httpMock.expectOne('https://baconipsum.com/api/?type=meat-and-filler');
    
    // STEP 4: Simulate empty API response
    // flush([]) simulates server returning an empty array
    req.flush([]);
  });

  // ============ TEST 4: ERROR HANDLING ============
  // Tests how service handles HTTP errors (network failures, server errors, etc.)
  it('should handle HTTP error', () => {
    // ============ ACT & ASSERT PHASE ============
    // STEP 1: Subscribe with error handling expectations
    service.getBaconText().subscribe({
      // STEP 2: Verify next() should not be called on error
      // fail() explicitly fails the test if success callback is triggered
      next: () => fail('Should have failed'),
      
      // STEP 3: Verify error callback receives proper error object
      error: (error: any) => {
        // STEP 4: Assert error status code
        // Verifies the HTTP error status is properly propagated
        expect(error.status).toBe(500);
      }
    });

    // ============ HTTP ERROR SIMULATION ============
    // STEP 5: Intercept the HTTP request
    const req = httpMock.expectOne('https://baconipsum.com/api/?type=meat-and-filler');
    
    // STEP 6: Simulate server error response
    // flush() with error parameters simulates HTTP 500 Internal Server Error
    // This triggers the Observable's error() callback
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
