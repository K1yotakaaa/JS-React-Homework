# ⚔️ Guild Roster — React Rendering & State Dashboard

A single-page React dashboard themed as a fantasy guild roster. Manage a party of
characters: recruit, dismiss, heal or hit them, change their rank, filter and reverse
the roster, and reset any character back to a fresh state.

**Live demo:** https://k1yotakaaa.github.io/JS-React-Homework/task3/

## What this demonstrates

This project was built for a seminar on **rendering and state** in React. Every
feature maps to a specific concept:

| Feature | Concept |
|---|---|
| Recruit / Dismiss buttons | Adding and removing items from state |
| Status `<select>` per card | Editing a piece of an item's data |
| Hit / Heal buttons, Show details toggle | **Local component state** (`hp`, `expanded`) that belongs to one card only |
| Status filter buttons | Deriving a filtered view from state, computed during render |
| Reverse order button | Deriving a reordered view without mutating the original array |
| Reset button | **Forcing a remount via `key`** to reset a component's local state on purpose |
| "use index as key" checkbox | A deliberate bug: shows what happens when keys are unstable |
| `console.log` in `App`, `CharacterList`, `CharacterCard` | Observing exactly which components re-render and when |

Only the `useState` hook is used anywhere in this project — no `useEffect`,
`useRef`, `useContext`, Redux, or any other state library.

## How state is structured

- **`App`** owns the single source of truth: the `characters` array, plus filter,
  reverse and demo-toggle state. Adding, removing, and editing status all go through
  functions in `App` that replace the array immutably (`map`/`filter`/spread).
- **`CharacterCard`** owns state that only makes sense per character: current HP and
  whether its details panel is expanded. `App` has no way to read a card's HP — that's
  intentional encapsulation, not a missing feature.
- **`AddCharacterForm`** owns its own input state while the form is being filled in.

## The key trick: reset and preservation

Each character keeps a `resetCount` field in `App`'s state. Cards are rendered with:

```jsx
key={buggyKeys ? index : `${character.id}-${character.resetCount}`}
```

- **Normal mode:** the key is tied to the character's stable `id`. Filtering or
  reversing the list just moves existing component instances around — React matches
  them by identity, so each character's HP and expanded state stay correctly attached
  to that character.
- **Reset button:** increments that character's `resetCount`, which changes its key.
  React sees a new key and mounts a **new** `CharacterCard` instance in place of the
  old one, so all of its local state (`hp`, `expanded`) reinitializes from scratch —
  without `App` needing to know what state the card even holds.
- **"use index as key" checkbox (demo only):** switches every card's key to its array
  position instead of its id. Reversing or filtering the list then visibly makes HP
  values jump onto the wrong characters, because React now matches cards by position
  instead of identity. This toggle exists purely to make that failure mode visible —
  it's not part of the app's real functionality.

## Tech

- React 19 + Vite
- Plain CSS (no UI framework)
- Portrait art generated per character via the [DiceBear](https://www.dicebear.com/) API
- Deployed with `gh-pages` into a `task3/` subfolder of the repo's `gh-pages` branch,
  alongside a separate React project (Task 2) at the branch root

## Run locally

```bash
npm install
npm run dev
```