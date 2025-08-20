import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestExampleComponent } from './test-example.component';
import { TestExampleService } from '../example-service/test-example.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('TestExampleComponent', () => {
  let component: TestExampleComponent;
  let fixture: ComponentFixture<TestExampleComponent>;
  let service: jasmine.SpyObj<TestExampleService>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('TestExampleService', [
      'getBaconTest',
    ]);

    await TestBed.configureTestingModule({
      imports: [TestExampleComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TestExampleComponent, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestExampleComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(
      TestExampleService
    ) as jasmine.SpyObj<TestExampleService>;
  });

  it('should create component' , () => {
    expect(component).toBeTruthy()
  })


  it('Shoult init with correct default value',() => {
    expect(component.baconText()).toEqual([])
    expect(component.isLoading()).toEqual(false)
  })


  it('Should display load button', () => {
    fixture.detectChanges()
    const button = fixture.nativeElement.querySelector('button')
    expect(button).toBeTruthy()
    expect(button.textContent.trim()).toBe('Load Bacon Text')
    
  })



});
