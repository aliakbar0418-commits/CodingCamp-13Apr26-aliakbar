// app.js — Expense & Budget Visualizer

/**
 * @typedef {Object} Transaction
 * @property {string} id       - Unique identifier (crypto.randomUUID() or Date.now().toString())
 * @property {string} name     - Item name, non-empty
 * @property {number} amount   - Positive float representing the expense amount
 * @property {string} category - Spending category: "Food", "Transport", or "Fun"
 */

/** @type {{ transactions: Transaction[] }} */
const state = {
  transactions: [],
};

// =============================================================================
// Storage Module
// =============================================================================

/**
 * Loads transactions from localStorage.
 * Reads the "expense_transactions" key, parses the JSON value, and returns
 * the resulting array. Returns an empty array if the key is absent or if the
 * stored value is not valid JSON.
 *
 * @returns {Transaction[]} The persisted transactions, or [] on any error.
 */
function loadTransactions() {
  try {
    const raw = localStorage.getItem("expense_transactions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persists the given transactions array to localStorage.
 * Serializes the array to JSON and writes it under the "expense_transactions" key.
 *
 * @param {Transaction[]} transactions - The transactions to save.
 */
function saveTransactions(transactions) {
  localStorage.setItem("expense_transactions", JSON.stringify(transactions));
}

// =============================================================================
// Validator
// =============================================================================

/**
 * Validates the transaction form inputs.
 *
 * Rules (Requirement 1.3):
 * - `name`:     trimmed length must be > 0
 * - `amount`:   must be parseable as a float AND the value must be > 0
 * - `category`: must be a non-empty string
 *
 * @param {string} name     - The item name from the form.
 * @param {string} amount   - The raw amount string from the form.
 * @param {string} category - The selected category value from the form.
 * @returns {{ valid: boolean, errors: { name?: string, amount?: string, category?: string } }}
 */
function validate(name, amount, category) {
  const errors = {};

  if (name.trim().length === 0) {
    errors.name = "Item name is required.";
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.amount = "Amount must be a positive number.";
  }

  if (category === "") {
    errors.category = "Please select a category.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// =============================================================================
// Renderer
// =============================================================================

/**
 * Computes the total balance from all transactions and updates the
 * `#balance-display` element in the DOM.
 *
 * - Sums `amount` across every transaction using `Array.reduce`.
 * - Formats the result as `$X.XX` (two decimal places).
 * - Displays `$0.00` when the array is empty (Requirement 3.4).
 *
 * @param {Transaction[]} transactions - The current list of transactions.
 */
function renderBalance(transactions) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const formatted = "$" + total.toFixed(2);
  document.getElementById("balance-display").textContent = "Total: " + formatted;
}

/**
 * Clears and re-renders the transaction list in the `#transaction-list` element.
 *
 * - Displays transactions newest-first (reverse iteration) (Requirement 2.3).
 * - Each `<li>` shows: item name, formatted amount, category badge, and a
 *   delete button with a `data-id` attribute (Requirements 2.1, 2.3).
 *
 * @param {Transaction[]} transactions - The current list of transactions.
 */
function renderList(transactions) {
  const ul = document.getElementById("transaction-list");
  ul.innerHTML = "";

  for (let i = transactions.length - 1; i >= 0; i--) {
    const t = transactions[i];

    const li = document.createElement("li");

    const nameSpan = document.createElement("span");
    nameSpan.className = "transaction-name";
    nameSpan.textContent = t.name;

    const amountSpan = document.createElement("span");
    amountSpan.className = "transaction-amount";
    amountSpan.textContent = "$" + t.amount.toFixed(2);

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "transaction-category";
    categoryBadge.textContent = t.category;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("data-id", t.id);

    li.appendChild(nameSpan);
    li.appendChild(amountSpan);
    li.appendChild(categoryBadge);
    li.appendChild(deleteBtn);

    ul.appendChild(li);
  }
}

// =============================================================================
// Pie Chart Renderer
// =============================================================================

/**
 * Fixed color mapping for each spending category.
 * @type {Object.<string, string>}
 */
const CATEGORY_COLORS = {
  Food: "#FF6384",
  Transport: "#36A2EB",
  Fun: "#FFCE56",
};

/**
 * Renders a pie chart of spending by category on `<canvas id="pie-chart">`.
 *
 * - If `transactions` is empty: hides the canvas and shows `#chart-placeholder`
 *   (Requirement 4.4).
 * - Otherwise: shows the canvas, hides the placeholder, groups transactions by
 *   category, sums amounts, and draws proportional arc slices starting at
 *   -π/2 (12 o'clock). Each slice is filled with its fixed category color and
 *   labelled with "CategoryName X%" at the midpoint angle (Requirements 4.1,
 *   4.2, 4.3, 4.5).
 *
 * @param {Transaction[]} transactions - The current list of transactions.
 */
function renderPieChart(transactions) {
  const canvas = document.getElementById("pie-chart");
  const placeholder = document.getElementById("chart-placeholder");

  if (transactions.length === 0) {
    canvas.style.display = "none";
    placeholder.style.display = "block";
    return;
  }

  canvas.style.display = "block";
  placeholder.style.display = "none";

  // Group transactions by category and sum amounts
  /** @type {Object.<string, number>} */
  const totals = {};
  for (const t of transactions) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }

  const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);

  // Ensure canvas has explicit dimensions (guards against display:none layout quirks)
  if (!canvas.width || canvas.width === 0) canvas.width = 300;
  if (!canvas.height || canvas.height === 0) canvas.height = 300;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) * 0.75;

  ctx.clearRect(0, 0, width, height);

  let startAngle = -Math.PI / 2; // Start at 12 o'clock

  for (const [category, amount] of Object.entries(totals)) {
    const sliceAngle = (amount / grandTotal) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    // Draw the slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = CATEGORY_COLORS[category] || "#CCCCCC";
    ctx.fill();

    // Draw the label at the midpoint angle
    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.65;
    const lx = cx + labelRadius * Math.cos(midAngle);
    const ly = cy + labelRadius * Math.sin(midAngle);
    const percentage = ((amount / grandTotal) * 100).toFixed(1);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(category + " " + percentage + "%", lx, ly);

    startAngle = endAngle;
  }
}

// =============================================================================
// Central Render Function
// =============================================================================

/**
 * Re-renders the entire UI to reflect the current state.
 *
 * Calls each renderer in sequence so the balance display, transaction list,
 * and pie chart are always consistent with `state.transactions`
 * (Requirements 3.2, 4.2, 6.2).
 */
function render() {
  renderBalance(state.transactions);
  renderList(state.transactions);
  renderPieChart(state.transactions);
}

// =============================================================================
// Event Handlers
// =============================================================================

/**
 * Handles the transaction form submit event.
 *
 * 1. Reads values from #item-name, #item-amount, #item-category.
 * 2. Calls validate(); on failure, displays inline errors and returns early.
 * 3. On success: creates a Transaction, pushes to state, saves, renders,
 *    and clears the form fields and error spans.
 *
 * Requirements: 1.3, 1.4, 1.5, 3.2, 4.2, 5.1
 *
 * @param {Event} event - The form submit event.
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById("item-name");
  const amountInput = document.getElementById("item-amount");
  const categoryInput = document.getElementById("item-category");

  const name = nameInput.value;
  const amount = amountInput.value;
  const category = categoryInput.value;

  const nameError = document.getElementById("name-error");
  const amountError = document.getElementById("amount-error");
  const categoryError = document.getElementById("category-error");

  // Clear previous errors (hide spans)
  nameError.textContent = "";
  nameError.style.display = "none";
  amountError.textContent = "";
  amountError.style.display = "none";
  categoryError.textContent = "";
  categoryError.style.display = "none";

  const { valid, errors } = validate(name, amount, category);

  if (!valid) {
    if (errors.name) {
      nameError.textContent = errors.name;
      nameError.style.display = "block";
    }
    if (errors.amount) {
      amountError.textContent = errors.amount;
      amountError.style.display = "block";
    }
    if (errors.category) {
      categoryError.textContent = errors.category;
      categoryError.style.display = "block";
    }
    return;
  }

  // Create and store the new transaction
  const transaction = {
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(),
    name: name.trim(),
    amount: parseFloat(amount),
    category,
  };

  state.transactions.push(transaction);
  saveTransactions(state.transactions);
  render();

  // Clear form fields and error spans
  nameInput.value = "";
  amountInput.value = "";
  categoryInput.value = "";
  nameError.textContent = "";
  nameError.style.display = "none";
  amountError.textContent = "";
  amountError.style.display = "none";
  categoryError.textContent = "";
  categoryError.style.display = "none";
}

// =============================================================================
// App Initialization
// =============================================================================

/**
 * Initialises the application once the DOM is ready.
 *
 * - Loads persisted transactions from localStorage into state.
 * - Renders the initial UI.
 * - Attaches the form submit event listener.
 * - Attaches the delete event listener (event delegation on #transaction-list).
 *
 * Requirements: 5.3, 5.4
 */
document.addEventListener("DOMContentLoaded", function () {
  state.transactions = loadTransactions();
  render();

  document.getElementById("transaction-form").addEventListener("submit", handleFormSubmit);

  document.getElementById("transaction-list").addEventListener("click", function (event) {
    const target = event.target;
    const id = target.getAttribute("data-id");
    if (!id) return;

    state.transactions = state.transactions.filter(function (t) {
      return t.id !== id;
    });
    saveTransactions(state.transactions);
    render();
  });
});
