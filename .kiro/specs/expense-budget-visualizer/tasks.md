# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a single-page, client-side expense tracker using HTML, CSS, and Vanilla JavaScript. The app is delivered as three files (`index.html`, `css/styles.css`, `js/app.js`) with no build step or backend. Tasks are ordered to build a working skeleton first, then layer in features incrementally, wiring everything together at the end.

## Tasks

- [x] 1. Scaffold project file structure and HTML skeleton
  - Create `index.html` with the full semantic HTML structure: `<header>` with balance display, `<main>` containing the transaction form section, pie chart section, and transaction list section
  - Create empty `css/styles.css` and `js/app.js` files linked from `index.html`
  - Add the three default category `<option>` elements (Food, Transport, Fun) to the category `<select>`
  - Add inline error `<span>` elements for each form field
  - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.3_

- [ ] 2. Implement the data model, state, and localStorage storage module
  - [x] 2.1 Define the Transaction object shape and in-memory state array in `app.js`
    - Transaction fields: `id` (string), `name` (string), `amount` (number), `category` (string)
    - Export/expose a `state` object holding the `transactions` array
    - _Requirements: 1.1, 5.1, 5.2, 5.3_

  - [x] 2.2 Implement `loadTransactions()` and `saveTransactions()` in `app.js`
    - `loadTransactions()`: reads `"expense_transactions"` from `localStorage`, parses JSON, returns `[]` on missing or malformed data (catch block)
    - `saveTransactions(transactions)`: serializes and writes to `localStorage`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.3 Write property test for storage round-trip fidelity
    - **Property 3: Storage round-trip fidelity**
    - For any array of valid Transaction objects T, `loadTransactions()` after `saveTransactions(T)` returns a deep-equal copy of T
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 2.4 Write unit tests for `loadTransactions()` edge cases
    - Test: `localStorage` key absent → returns `[]`
    - Test: `localStorage` contains malformed JSON → returns `[]` without throwing
    - Test: `localStorage` contains valid JSON array → returns parsed array
    - _Requirements: 5.4_

- [ ] 3. Implement the Validator
  - [x] 3.1 Implement `validate(name, amount, category)` in `app.js`
    - Returns an object `{ valid: boolean, errors: { name?, amount?, category? } }`
    - `name` invalid if trimmed length === 0
    - `amount` invalid if not parseable as float or value ≤ 0
    - `category` invalid if empty string
    - _Requirements: 1.3, 1.4_

  - [ ]* 3.2 Write property test for Validator rejecting invalid inputs
    - **Property 4: Validator rejects invalid inputs**
    - For any input where name is empty string, amount ≤ 0, or category is empty, `validate()` must return `valid: false`
    - **Validates: Requirements 1.3, 1.4**

  - [ ]* 3.3 Write unit tests for Validator
    - Test: all fields valid → `{ valid: true, errors: {} }`
    - Test: empty name → error on `name` field
    - Test: amount = 0 → error on `amount` field
    - Test: negative amount → error on `amount` field
    - Test: non-numeric amount string → error on `amount` field
    - Test: no category selected → error on `category` field
    - _Requirements: 1.3, 1.4_

- [ ] 4. Implement the Balance Display renderer
  - [x] 4.1 Implement `renderBalance(transactions)` in `app.js`
    - Computes `transactions.reduce((sum, t) => sum + t.amount, 0)`
    - Formats result as `$X.XX` using `toFixed(2)`
    - Updates `#balance-display` text content
    - Shows `$0.00` when array is empty
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.2 Write property test for balance consistency
    - **Property 1: Balance consistency**
    - For any array of transactions, `renderBalance` sets the display to exactly the sum of all `amount` fields
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [ ] 5. Implement the Transaction List renderer
  - [x] 5.1 Implement `renderList(transactions)` in `app.js`
    - Clears `#transaction-list` and re-renders all transactions
    - Renders newest-first (reverse iteration or `unshift`)
    - Each `<li>` shows: item name, formatted amount, category badge, and a delete `<button>` with `data-id` attribute
    - _Requirements: 2.1, 2.3_

  - [ ]* 5.2 Write property test for newest-first ordering
    - **Property: Newest-first ordering**
    - For any sequence of N transactions added in order, the first `<li>` in the rendered list always corresponds to the last transaction added
    - **Validates: Requirement 2.3**

  - [ ]* 5.3 Write unit tests for `renderList`
    - Test: empty array → `#transaction-list` is empty
    - Test: single transaction → one `<li>` with correct name, amount, category, and `data-id`
    - Test: two transactions → first `<li>` is the second transaction added (newest-first)
    - _Requirements: 2.1, 2.3_

- [ ] 6. Implement the Pie Chart renderer
  - [x] 6.1 Implement `renderPieChart(transactions)` in `app.js`
    - If `transactions` is empty: hide `<canvas id="pie-chart">`, show `#chart-placeholder`
    - Otherwise: show canvas, hide placeholder
    - Group transactions by category, sum amounts per category
    - Draw arcs using Canvas 2D API starting at `-π/2` (12 o'clock)
    - Each slice sized proportionally: `sliceAngle = (categoryTotal / grandTotal) * 2π`
    - Fill each slice with its fixed category color (Food `#FF6384`, Transport `#36A2EB`, Fun `#FFCE56`)
    - Draw label at midpoint angle: `"CategoryName X%"` (percentage rounded to 1 decimal)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 6.2 Write property test for pie chart proportion consistency
    - **Property 2: Pie chart proportion consistency**
    - For any non-empty transaction list, for each category C: `sliceAngle(C) / (2π) = Σ amount(C) / Σ amount(all)` within floating-point tolerance
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ]* 6.3 Write unit tests for `renderPieChart`
    - Test: empty transactions → canvas hidden, placeholder visible
    - Test: single category → one full-circle slice (angle ≈ 2π)
    - Test: two categories with equal amounts → each slice angle ≈ π
    - _Requirements: 4.1, 4.4_

- [ ] 7. Checkpoint — Ensure all tests pass
  - Run all unit and property tests; verify balance, list, chart, validator, and storage modules work in isolation.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement the central `render()` function and event handlers
  - [x] 8.1 Implement `render()` in `app.js`
    - Calls `renderBalance(state.transactions)`, `renderList(state.transactions)`, `renderPieChart(state.transactions)` in sequence
    - _Requirements: 3.2, 4.2, 6.2_

  - [ ]* 8.2 Write property test for render idempotency
    - **Property 6: Render idempotency**
    - Calling `render()` twice with the same `state.transactions` produces identical DOM output as calling it once
    - **Validates: Requirements 3.2, 4.2, 6.2**

  - [x] 8.3 Implement form submit event handler
    - Reads `#item-name`, `#item-amount`, `#item-category` values
    - Calls `validate()`; on failure, displays inline errors in the corresponding `<span class="error">` elements and returns
    - On success: creates a Transaction object with a unique `id`, pushes to `state.transactions`, calls `saveTransactions()`, calls `render()`, clears form fields and error spans
    - _Requirements: 1.3, 1.4, 1.5, 3.2, 4.2, 5.1_

  - [x] 8.4 Implement delete event handler (event delegation on `#transaction-list`)
    - Listens for click events on `#transaction-list`; checks if target has `data-id`
    - Filters `state.transactions` to remove the matching id
    - Calls `saveTransactions()`, then `render()`
    - _Requirements: 2.4, 3.3, 4.3, 5.2_

  - [ ]* 8.5 Write property test for delete removes exactly one transaction
    - **Property 5: Delete removes exactly one transaction**
    - After deleting transaction with id X from a list of N transactions, the resulting list has N-1 items, contains all original transactions except id X, and no other transactions are removed
    - **Validates: Requirements 2.4, 3.3, 4.3**

- [x] 9. Implement app initialization (`DOMContentLoaded`)
  - Wire `DOMContentLoaded` listener in `app.js`
  - Call `state.transactions = loadTransactions()` then `render()`
  - Attach form submit and list click event listeners
  - _Requirements: 5.3, 5.4_

- [ ] 10. Implement CSS styling
  - [x] 10.1 Write base layout styles in `css/styles.css`
    - Flexbox or Grid layout for the main sections (form, chart, list)
    - Responsive layout: no horizontal scroll from 320px to 1920px (use `max-width`, `flex-wrap`, or media queries)
    - _Requirements: 8.3_

  - [x] 10.2 Style the form, balance display, and transaction list
    - Clear typographic hierarchy: `h1` for app title, `label` for form fields, bold/monospace for amounts
    - Sufficient color contrast for readability
    - `.error` class: red text, small font, hidden by default (`display: none`), shown via JS by toggling style
    - `#transaction-list`: `max-height: 300px; overflow-y: auto;` for scrollability
    - _Requirements: 2.2, 8.1, 8.2_

  - [x] 10.3 Style the pie chart section
    - Canvas centered within its section
    - Placeholder text styled and centered
    - _Requirements: 4.4, 4.5_

- [ ] 11. Final checkpoint — Integration and end-to-end verification
  - [x] 11.1 Wire all modules together and verify the full event flow
    - Confirm: add transaction → list updates, balance updates, chart updates, data saved to localStorage
    - Confirm: delete transaction → list updates, balance updates, chart updates, data saved to localStorage
    - Confirm: page reload → transactions restored from localStorage
    - _Requirements: 1.5, 2.4, 3.2, 3.3, 4.2, 4.3, 5.3_

  - [ ]* 11.2 Write integration tests for the full add/delete/reload cycle
    - Test: add 3 transactions across different categories → balance = sum, chart has 3 slices, list has 3 items
    - Test: delete 1 transaction → balance decreases, chart updates, list has 2 items
    - Test: simulate page reload (call `loadTransactions()` after `saveTransactions()`) → all transactions restored
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 11.3 Verify file structure constraints
    - Confirm exactly one CSS file at `css/styles.css`
    - Confirm exactly one JS file at `js/app.js`
    - Confirm `index.html` links both files correctly and is openable directly in a browser
    - _Requirements: 7.1, 7.2, 7.3_

  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical boundaries
- Property tests validate universal correctness properties (Properties 1–6 from the design document)
- Unit tests validate specific examples and edge cases
- The app uses no external libraries — all rendering uses the DOM and Canvas 2D APIs directly
