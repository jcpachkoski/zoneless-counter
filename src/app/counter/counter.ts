import { Component, model } from '@angular/core';

@Component({
  // No selector string needed in v22 when using class-based imports
  selector: 'app-counter', // Errors if not provided.  Language service needs update.
  template: `
    <div style="border: 2px solid #333; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
      <h3>Counter Tool</h3>
      <p>Value: <strong>{{ count() }}</strong></p>
      
      <button (click)="count.update(v => v - 1)">- 1</button>
      <button (click)="count.update(v => v + 1)">+ 1</button>
    </div>
  `
})
export class Counter {
  // v22 signal-based two-way binding
  count = model.required<number>();
}
