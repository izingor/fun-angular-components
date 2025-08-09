import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestExampleService {
  private readonly apiUrl = 'https://baconipsum.com/api/?type=meat-and-filler';

  private http = inject(HttpClient);

  getBaconText(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl);
  }
}
