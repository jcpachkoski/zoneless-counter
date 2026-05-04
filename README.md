# ZonelessCounter

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.9.

This v22 architecture solves the conflict between reactive signals and the browser’s localStorage. Here is a deep dive into why this specific combination of primitives is used.

## 1. The Reactive Logic: linkedSignal
The highScore is defined as a linkedSignal.

* The Problem it Solves: In older versions, you’d use an effect to watch score and manually call highScore.set(). This creates a "double-hop" update (score changes → effect runs → high score changes), which can cause UI flickering.
* The v22 Advantage: A linkedSignal is integrated into the signal graph. When score changes, the high score is recalculated in the same breath. It is "glitch-free," meaning Angular will never accidentally render a frame where the score is 10 but the high score is still 5.
* The Computation: It uses the previous parameter to compare the current value against its own last known state. This allows it to act as a memory-cell that only moves forward.

## 2. The Hydration: afterNextRender
This is used strictly for the initial data pull.

* Why here? In an SSR project, the constructor runs on the server where localStorage does not exist. afterNextRender is a lifecycle hook that guarantees the code only executes once the app is alive in the browser.
* The Flow: It reads the "old" data and calls .set() on the signals. This "seeds" the application state.

## 3. The Persistence: afterRenderEffect
This is the most critical piece of the v22 puzzle and why your app stopped resetting to zero.

* The Difference from effect(): A standard effect is very aggressive; it runs as soon as it's created. In your previous "broken" version, the standard effect saw score was 0 during initialization and immediately overwrote your localStorage with 0 before the hydration could even start.
* How it Fixes the "Refresh Bug": afterRenderEffect is designed for post-render synchronization. It waits for Angular to complete its initial rendering cycle before it starts tracking.
* The Timing:
1. App Starts: Signals are 0.
   2. Hydration: afterNextRender fires, updating signals to their "saved" values (e.g., score = 10).
   3. Persistence: afterRenderEffect kicks in after that first render is stable. It sees the signals are already 10 and starts syncing from there. It never "sees" the initial 0, so it never overwrites your data.

## 4. Direct Signal Writes (Standard v19/v22)
In the clearAll method and the hydration hook, you’ll notice we call .set() on both score and highScore.

* In earlier Signal previews, writing to a signal inside a reactive context required flags like allowSignalWrites.
* In v22, this is unlocked by default. Angular’s scheduler is now smart enough to batch these writes, meaning even though you call .set() twice, the user only sees a single, smooth UI update.

## Summary of the Data Cycle

   1. Source Change: User clicks button $\rightarrow$ score.update()
   2. Internal Sync: highScore (linkedSignal) detects score change and recalculates immediately.
   3. UI Update: Angular renders the new values to the screen.
   4. External Sync: afterRenderEffect sees the render is done and pushes the new values to localStorage.

Do you want to see how to use the resource API (another v22 feature) to handle the localStorage loading as an asynchronous data fetch?



## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
