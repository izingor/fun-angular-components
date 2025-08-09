import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { TestExampleService } from './test-example.service';

describe('TestExampleService', () => {
  let service: TestExampleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TestExampleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch bacon text from API', () => {
    const mockResponse = [
      'Bacon ipsum dolor amet beef ribs pork chop',
      'Meatball chuck turkey drumstick'
    ];

    service.getBaconText().subscribe((response: string[]) => {
      expect(response).toEqual(mockResponse);
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBe(2);
    });

    const req = httpMock.expectOne('https://baconipsum.com/api/?type=meat-and-filler');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle empty response', () => {
    service.getBaconText().subscribe((response: string[]) => {
      expect(response).toEqual([]);
    });

    const req = httpMock.expectOne('https://baconipsum.com/api/?type=meat-and-filler');
    req.flush([]);
  });

  it('should handle HTTP error', () => {
    service.getBaconText().subscribe({
      next: () => fail('Should have failed'),
      error: (error: any) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('https://baconipsum.com/api/?type=meat-and-filler');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
