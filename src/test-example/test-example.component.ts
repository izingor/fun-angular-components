import { Component, inject, signal } from '@angular/core';
import { TestExampleService } from '../example-service/test-example.service';

@Component({
  selector: 'app-test-example',
  imports: [],
  templateUrl: './test-example.component.html',
  styleUrl: './test-example.component.scss'
})
export class TestExampleComponent {
  baconText = signal<string[]>([]);
  isLoading = signal(false);

  testExampleService = inject(TestExampleService);

  loadBaconText(): void {
    this.isLoading.set(true);
    this.testExampleService.getBaconText().subscribe({
      next: (data) => {
        this.baconText.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.baconText.set([]);
        this.isLoading.set(false);
      }
    });
  }
}
