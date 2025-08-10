import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TestExampleComponent } from "./test-example.component";
import { TestExampleService } from "../example-service/test-example.service";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe('TestExampleComponent', () => {
  let component: TestExampleComponent
  let fixture: ComponentFixture<TestExampleComponent>
  let service: jasmine.SpyObj<TestExampleService>


  beforeEach(async () => {

    const serviceSpy = jasmine.createSpyObj('TestExampleService', ['getBaconText'])

    await TestBed.configureTestingModule({
      imports: [TestExampleComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TestExampleComponent, useValue: serviceSpy }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TestExampleComponent)
    component = fixture.componentInstance
    service = TestBed.inject(TestExampleService) as jasmine.SpyObj<TestExampleService>
  })

  //basic test
  it('Should create a component', () => {
    expect(component).toBeTruthy()
  })


  //Test dom rendering of the load button

  it('Should display load button',() => {
    const button = fixture.nativeElement.querySelector('button')
    expect(button).toBeTruthy()
  })


});


