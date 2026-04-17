# Design Document: Expense & Budget Visualizer

## Overview

A single-page, client-side web application built with HTML, CSS, and Vanilla JavaScript. The app lets users record expense transactions, view a running total balance, browse a scrollable transaction list, and see a live pie chart of spending by category. All data is persisted in the browser's `localStorage`. No build step, no backend, no dependencies.

---

## Architecture

### File Structure

```
expense-budget-visualizer/
├── index.html
├── css/
│   └── styles.css
└── js/
    └── app.js
```

This satisfies Requirements 7.1, 7.2, and 7.3.

### Module Responsibilities (within `app.js`)

The single JavaScript file is organized into logical sections:

| Section | Responsibility |
|---|---|
| **Storage** | Read/write transactions to `localStorage` |
| **State** | In-memory array of transactions; single source of truth |
| **Validator** | Validate form inputs before submission |
| **Renderer** | Re-render the transaction list, balance, and pie chart |
| **PieChart** | Draw the pie chart on a `<canvas>` element |
| **EventHandlers** | Wire DOM events to state mutations and re-renders |
| **Init** | Bootstrap the app on `DOMContentLoaded` |

---

## Data Model

### Transaction Object

```js
{
  id: string,        // crypto.randomUUID() or Date.now().toString()
  name: string,      // item name, non-empty
  amount: number,    // positive float
  category: string   // one of: "Food", "Transport", "Fun"
}
```

### localStorage Schema

Key: `"expense_transactions"`  
Value: JSON-serialized array of Transaction objects.

```js
// Write
localStorage.setItem("expense_transactions", JSON.stringify(transactions));

// Read
const raw = localStorage.getItem("expense_transactions");
const transactions = raw ? JSON.parse(raw) : [];
```

If `JSON.parse` throws (malformed data), the app catches the error and initializes with `[]` (Requirement 5.4).

---

## Component Design

### 1. HTML Structure (`index.html`)

```
<body>
  <header>
    <h1>Expense & Budget Visualizer</h1>
    <div id="balance-display">Total: $0.00</div>
  </header>

  <main>
    <section id="form-section">
      <form id="transaction-form">
        <input type="text"   id="item-name"    placeholder="Item name" />
        <span  id="name-error"   class="error"></span>
        <input type="number" id="item-amount"  placeholder="Amount" min="0.01" step="0.01" />
        <span  id="amount-error" class="error"></span>
        <select id="item-category">
          <option value="">Select category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Fun">Fun</option>
        </select>
        <span  id="category-error" class="error"></span>
        <button type="submit">Add Transaction</button>
      </form>
    </section>

    <section id="chart-section">
      <canvas id="pie-chart"></canvas>
      <p id="chart-placeholder">No transactions yet.</p>
    </section>

    <section id="list-section">
      <ul id="transaction-list"></ul>
    </section>
  </main>
</body>
```

### 2. Input Form & Validator

**Validation rules** (Requirement 1.3):
- `name`: trimmed length > 0
- `amount`: parseable as float AND > 0
- `category`: non-empty string

On failure: display inline error message in the corresponding `<span class="error">` and `return` without adding the transaction (Requirement 1.4).

On success: add transaction, clear form fields, clear error messages (Requirement 1.5).

### 3. Transaction List

- Rendered as `<li>` elements inside `<ul id="transaction-list">`.
- Each `<li>` shows: name, formatted amount, category badge, and a delete button.
- List is ordered newest-first (prepend or reverse-render) (Requirement 2.3).
- The `<ul>` has `overflow-y: auto` with a fixed `max-height` to enable scrolling (Requirement 2.2).
- Delete button carries a `data-id` attribute; click handler removes the matching transaction from state (Requirement 2.4).

### 4. Balance Display

- A single DOM element (`#balance-display`) updated on every state change.
- Computed as `transactions.reduce((sum, t) => sum + t.amount, 0)`.
- Formatted with `toFixed(2)` and a currency prefix.
- Shows `$0.00` when the array is empty (Requirement 3.4).

### 5. Pie Chart

Drawn on a `<canvas id="pie-chart">` using the Canvas 2D API — no external charting library.

**Algorithm**:

```
function drawPieChart(transactions):
  if transactions is empty:
    hide canvas, show placeholder text
    return

  show canvas, hide placeholder text

  totals = group transactions by category, summing amounts
  grandTotal = sum of all amounts

  startAngle = -π/2   // start at 12 o'clock
  for each (category, amount) in totals:
    sliceAngle = (amount / grandTotal) * 2π
    draw arc from startAngle to startAngle + sliceAngle
    fill with category color
    compute midpoint angle, draw label: "CategoryName X%"
    startAngle += sliceAngle
```

**Category colors** (fixed mapping):
- Food → `#FF6384`
- Transport → `#36A2EB`
- Fun → `#FFCE56`

Labels are drawn inside each slice at the midpoint angle, offset from center (Requirement 4.5).

### 6. Storage Module

```
function loadTransactions():
  try:
    raw = localStorage.getItem("expense_transactions")
    return raw ? JSON.parse(raw) : []
  catch:
    return []

function saveTransactions(transactions):
  localStorage.setItem("expense_transactions", JSON.stringify(transactions))
```

### 7. Render Cycle

A single `render()` function is called after every state mutation:

```
function render():
  renderBalance(state.transactions)
  renderList(state.transactions)
  renderPieChart(state.transactions)
```

This ensures the UI is always consistent with state (Requirements 2, 3, 4).

---

## Event Flow

```
User submits form
  → validate()
    → FAIL: show errors, stop
    → PASS: create Transaction object
              → push to state.transactions
              → saveTransactions(state.transactions)
              → render()
              → clear form

User clicks delete button
  → read data-id from button
  → filter state.transactions to remove matching id
  → saveTransactions(state.transactions)
  → render()

App loads (DOMContentLoaded)
  → state.transactions = loadTransactions()
  → render()
```

---

## CSS Design

- Single file: `css/styles.css`.
- Responsive layout using CSS Flexbox/Grid; no horizontal scroll from 320px to 1920px (Requirement 8.3).
- Color scheme with sufficient contrast (Requirement 8.2).
- Clear typographic hierarchy: `h1` for app title, labels for form fields, monospace or bold for amounts (Requirement 8.1).
- `.error` class: red text, small font, hidden by default (`display: none`), shown when validation fails.
- `#transaction-list`: `max-height: 300px; overflow-y: auto;` for scrollability.

---

## Correctness Properties

The following universal properties hold for any valid sequence of add/delete operations:

**Property 1: Balance consistency**  
At all times, `Balance_Display = Σ amount for all transactions in Transaction_List`.  
_Validates: Requirements 3.1, 3.2, 3.3, 3.4_

**Property 2: Pie chart proportion consistency**  
For each category C with at least one transaction, `slice_angle(C) / 2π = Σ amount(C) / Σ amount(all)`.  
_Validates: Requirements 4.1, 4.2, 4.3_

**Property 3: Storage round-trip fidelity**  
For any transaction list T, `loadTransactions(saveTransactions(T)) = T` (identity under serialization/deserialization).  
_Validates: Requirements 5.1, 5.2, 5.3_

**Property 4: Validator rejects invalid inputs**  
For any form submission where name is empty, amount ≤ 0, or category is empty, the transaction count does not increase.  
_Validates: Requirements 1.3, 1.4_

**Property 5: Delete removes exactly one transaction**  
After deleting a transaction with id X, the resulting list contains all original transactions except the one with id X, and no other transactions are removed.  
_Validates: Requirements 2.4, 3.3, 4.3_

**Property 6: Render idempotency**  
Calling `render()` twice with the same state produces the same DOM output as calling it once.  
_Validates: Requirements 3.2, 4.2, 6.2_
