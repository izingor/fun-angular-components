import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { TestExampleService } from '../example-service/test-example.service';
import { TestExampleComponent } from './test-example.component';

describe('TestExampleComponent', () => {
  let component: TestExampleComponent;
  let fixture: ComponentFixture<TestExampleComponent>;
  let service: jasmine.SpyObj<TestExampleService>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('TestExampleService', [
      'getBaconText',
    ]);

    await TestBed.configureTestingModule({
      imports: [TestExampleComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TestExampleService, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestExampleComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(
      TestExampleService
    ) as jasmine.SpyObj<TestExampleService>;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('Shoult init with correct default value', () => {
    expect(component.baconText()).toEqual([]);
    expect(component.isLoading()).toEqual(false);
  });

  it('Should display load button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toBe('Load Bacon Text');
  });


  it('Should update DOM after fetched data arrives', () => {
    const dataSubject = new Subject<string[]>()
    const mockData = ['Mock data', 'more data']
    const button = fixture.nativeElement.querySelector('button')

    service.getBaconText.and.returnValue(dataSubject.asObservable())

    expect(component.isLoading()).toBe(false)
    expect(component.baconText()).toEqual([])
    

    component.loadBaconText()

    expect(component.isLoading()).toBe(true)
    expect(component.baconText()).toEqual([])

    dataSubject.next(mockData)
    dataSubject.complete()

    expect(component.isLoading()).toBe(false)
    expect(component.baconText()).toEqual(mockData)

    fixture.detectChanges()
    const paragraphs = fixture.nativeElement.querySelectorAll('.bacon-content p')
    expect(paragraphs.length).toBe(2)
    expect(paragraphs[0].textContent.trim()).toBe(mockData[0])
    expect(paragraphs[1].textContent.trim()).toBe(mockData[1])

  })
});
