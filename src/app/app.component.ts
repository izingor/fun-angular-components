import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PopoverComponent, PopoverPlacement } from '../popover/popover.component';

@Component({
  selector: 'app-root',
  imports: [PopoverComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fun';

  placements: PopoverPlacement[] = ['bottom', 'top', 'left', 'right'];
  currentPlacement: PopoverPlacement = 'bottom';

  onButtonClick() {
    console.log('Button clicked');
  }

  changePlacement(placement: PopoverPlacement) {
    this.currentPlacement = placement;
  }
}
