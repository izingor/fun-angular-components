import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PopoverComponent } from '../popover/popover.component';

@Component({
  selector: 'app-root',
  imports: [PopoverComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fun';

  onButtonClick() {
    console.log('Button clicked');
  }
}
