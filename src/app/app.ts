import { Component, signal, linkedSignal, afterNextRender, afterRenderEffect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Counter } from './counter/counter';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Counter],
  template: `
    <main>
      <h1>Angular v22 Master</h1>
      
      <div class="stats">
        <p>Current Score: <mark>{{ score() }}</mark></p>
        <p>Session High Score: <strong>{{ highScore() }}</strong></p>
      </div>

      <!-- Two-way binding with the Counter component -->
      <app-counter [(count)]="score" />

      <div class="controls">
        <button (click)="score.set(0)">Reset Current</button>
        <button class="clear" (click)="clearAll()">Clear All Data</button>
      </div>

      <router-outlet />
    </main>
  `,
  styles: `
    main {
      max-width: 500px;
      margin: 40px auto;
      text-align: center;
      background: #ffffff;
      padding: 2.5rem;
      border-radius: 24px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;

      h1 { color: #1a1a1a; margin-bottom: 1.5rem; font-weight: 800; }

      .stats {
        margin-bottom: 2rem;
        p { margin: 0.5rem 0; color: #666; font-size: 1.1rem; }
      }

      mark {
        background: #e3f2fd;
        color: #1976d2;
        padding: 0.3rem 0.8rem;
        border-radius: 6px;
        font-weight: 700;
        font-family: 'Cascadia Code', 'Courier New', monospace;
        font-size: 1.3rem;
      }

      strong { color: #2e7d32; font-size: 1.2rem; }

      .controls {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 2rem;
      }

      button {
        background: #f0f0f0;
        border: none;
        padding: 0.8rem 1.2rem;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover { background: #e0e0e0; transform: translateY(-2px); }
        &:active { transform: translateY(0); }

        &.clear {
          background: #fff1f0;
          color: #cf1322;
          &:hover { background: #ffa39e; color: #fff; }
        }
      }
    }
  `
})
export class App {
  score = signal(0);

  highScore = linkedSignal<number, number>({
    source: this.score,
    computation: (current: number, previous?: { source: number; value: number }) => {
      const best = previous?.value ?? 0;
      return current > best ? current : best;
    }
  });

  constructor() {
    /**
     * 1. Hydration (Initial Load)
     * Replaces isPlatformBrowser by only executing in the browser 
     * after the first render is complete.
     * This is used strictly for the initial data pull.
     */
    afterNextRender(() => {
      this.score.set(Number(localStorage.getItem('score') ?? 0));
      this.highScore.set(Number(localStorage.getItem('high') ?? 0));
    });

    /**
     * 2. Persistence (The v22 way)
     * afterRenderEffect is safer than effect() for SSR because it 
     * automatically skips server-side execution and only runs 
     * once the DOM is stable.
     */
    afterRenderEffect(() => {
      localStorage.setItem('score', this.score().toString());
      localStorage.setItem('high', this.highScore().toString());
    });
  }

  clearAll() {
    localStorage.clear();
    this.score.set(0);
    this.highScore.set(0);
  }
}