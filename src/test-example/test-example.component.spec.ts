import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { TestExampleComponent } from './test-example.component';
import { TestExampleService } from '../example-service/test-example.service';

describe('TestExampleComponent', () => {
  let component: TestExampleComponent;
  let fixture: ComponentFixture<TestExampleComponent>;
  let service: jasmine.SpyObj<TestExampleService>;

  beforeEach(async () => {

    const serviceSpy = jasmine.createSpyObj('TestExampleService', ['getBaconText']);

    await TestBed.configureTestingModule({
      imports: [TestExampleComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TestExampleService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestExampleComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TestExampleService) as jasmine.SpyObj<TestExampleService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty bacon text and not loading', () => {
    expect(component.baconText()).toEqual([]);
    expect(component.isLoading()).toBe(false);
  });

  it('should display load button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toBe('Load Bacon Text');
    expect(button.disabled).toBe(false);
  });

  it('should load bacon text when button is clicked', () => {
    const mockData = ['Test bacon text', 'Another paragraph'];
    service.getBaconText.and.returnValue(of(mockData));

    component.loadBaconText();

    expect(service.getBaconText).toHaveBeenCalled();
    expect(component.baconText()).toEqual(mockData);
    expect(component.isLoading()).toBe(false);
  });
  
  it('should show loading state when request is in progress (async)', async () => {
    const mockData = ['Test bacon text'];
    service.getBaconText.and.returnValue(of(mockData));

    const promise = component.loadBaconText();
    expect(component.isLoading()).toBe(true);

    await promise;

    expect(component.isLoading()).toBe(false);
    expect(component.baconText()).toEqual(mockData);
  });

  it('should display bacon text after successful load', () => {
    const mockData = ['First paragraph', 'Second paragraph'];
    service.getBaconText.and.returnValue(of(mockData));

    component.loadBaconText();
    fixture.detectChanges();

    const paragraphs = fixture.nativeElement.querySelectorAll('.bacon-content p');
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].textContent).toBe('First paragraph');
    expect(paragraphs[1].textContent).toBe('Second paragraph');
  });

  it('should not display content div when no data', () => {
    fixture.detectChanges();
    const contentDiv = fixture.nativeElement.querySelector('.bacon-content');
    expect(contentDiv).toBeFalsy();
  });

  it('should handle service error', () => {
    service.getBaconText.and.returnValue(throwError(() => new Error('API Error')));

    component.loadBaconText();

    expect(component.baconText()).toEqual([]);
    expect(component.isLoading()).toBe(false);
  });

  it('should disable button and show loading text during request', () => {
    service.getBaconText.and.returnValue(of(['test']));
    
    component.isLoading.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
    expect(button.textContent.trim()).toBe('Loading...');
  });
});
