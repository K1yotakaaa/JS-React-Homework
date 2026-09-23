# Async Lab - JavaScript Runtime and Async

Open `index.html` in a browser. Only HTML, CSS and vanilla JS.

## Closure and the private counter
`createTask(name)` declares `let count = 0` inside the function. The returned object exposes `run`, `getCount` and `reset`, which close over `count`, but there is no `task.count` property. Each call creates a new scope, so every task has its own counter.

## Call stack example
Click "Run": `onclick` → `task.run()` → `simulate()` → `new Promise(executor)` → `setTimeout(...)`. Each call is pushed on the stack; `setTimeout` returns immediately, then `simulate`, the executor and `run` (at its first `await`) return, and the stack empties.

## How JS continues while setTimeout waits
`setTimeout` hands the timer to the browser (Web API). The stack is free, so the page stays responsive and other tasks start. When the delay ends, the callback is placed in the task queue and the event loop runs it once the stack is empty.

## Event Loop demo
Predicted (and actual) output:
```
script start
async fn start
script end
promise 1
async fn after await
promise 2
timer 1 (0ms)
timer 2 (10ms)
```
Why: sync code runs first (start, async fn start, end). Then microtasks run: `promise 1` (which queues `promise 2`), the `await` continuation, then `promise 2`. Finally the timers, as tasks.

## Tasks vs microtasks
Tasks (setTimeout, events) are taken one per event loop turn. Microtasks (`.then`, `await` continuations) run right after the current code, and the whole queue is drained before the next task. So promise callbacks always beat timers, even `setTimeout(..., 0)`.

## Multiple promises and errors
`run()` uses `try/catch/finally`: it sets "Failed", rethrows, and `finally` records the time. "Run All" uses `Promise.allSettled`, which never rejects and waits for every task, so "All tasks finished" appears only when all completed or failed. (`Promise.all` would reject on the first failure and finish early.) Single runs use `.catch(() => {})` to avoid unhandled rejections.

## Sequential vs concurrent
`await` one by one means each timer starts after the previous ends, so total ≈ sum of the delays. Starting all promises together lets the timers wait in parallel, so total ≈ the longest delay. The comparison button shows both times.

## Extras
Progress bars fill over each task's random delay, a slider sets the failure rate, the sequential/concurrent comparison is drawn as a timeline, and the Step button walks the demo through call stack, Web APIs, microtask queue and task queue.