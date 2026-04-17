# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It allows users to track personal expenses by entering transactions with a name, amount, and category. The app displays a running total balance, a scrollable transaction list with delete capability, and a live pie chart showing spending distribution by category. All data is persisted in the browser's Local Storage — no backend or server is required.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense entry consisting of a name, amount, and category.
- **Transaction_List**: The scrollable UI component that displays all recorded transactions.
- **Input_Form**: The UI form used to enter a new transaction.
- **Balance_Display**: The UI component at the top of the page showing the total of all transaction amounts.
- **Pie_Chart**: The visual chart component showing spending distribution by category.
- **Category**: A label classifying a transaction. Default categories are Food, Transport, and Fun.
- **Local_Storage**: The browser's built-in Web Storage API used for client-side data persistence.
- **Validator**: The logic component responsible for checking that form inputs meet required conditions before submission.

---

## Requirements

### Requirement 1: Transaction Input

**User Story:** As a user, I want to enter a transaction with a name, amount, and category, so that I can record my expenses.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a text field for the item name, a numeric field for the amount, and a dropdown selector for the category.
2. THE Input_Form SHALL include the default categories Food, Transport, and Fun in the category selector.
3. WHEN the user submits the Input_Form, THE Validator SHALL verify that the item name field is not empty, the amount field contains a positive numeric value, and a category is selected.
4. IF the Validator detects that any required field is empty or invalid, THEN THE Input_Form SHALL display an inline error message identifying the invalid field and prevent the transaction from being added.
5. WHEN the Input_Form passes validation, THE App SHALL add the transaction to the Transaction_List and clear the Input_Form fields.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my recorded transactions in a scrollable list, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each transaction's item name, amount, and category.
2. WHILE the number of transactions exceeds the visible area of the Transaction_List, THE Transaction_List SHALL be scrollable.
3. THE Transaction_List SHALL display transactions in the order they were added, with the most recent transaction at the top.
4. WHEN a user activates the delete control for a transaction, THE App SHALL remove that transaction from the Transaction_List.

---

### Requirement 3: Total Balance Display

**User Story:** As a user, I want to see my total spending at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all transaction amounts.
2. WHEN a transaction is added, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
4. WHEN no transactions exist, THE Balance_Display SHALL display a total of zero.

---

### Requirement 4: Pie Chart Visualization

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand how my money is distributed.

#### Acceptance Criteria

1. THE Pie_Chart SHALL display one segment per category that has at least one transaction, sized proportionally to that category's total amount relative to all transactions.
2. WHEN a transaction is added, THE Pie_Chart SHALL update automatically to reflect the new spending distribution.
3. WHEN a transaction is deleted, THE Pie_Chart SHALL update automatically to reflect the updated spending distribution.
4. WHEN no transactions exist, THE Pie_Chart SHALL display an empty or placeholder state.
5. THE Pie_Chart SHALL label each segment with the category name and its percentage of total spending.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my transactions to be saved between browser sessions, so that I do not lose my data when I close or refresh the page.

#### Acceptance Criteria

1. WHEN a transaction is added, THE App SHALL write the updated transaction list to Local_Storage.
2. WHEN a transaction is deleted, THE App SHALL write the updated transaction list to Local_Storage.
3. WHEN the App loads, THE App SHALL read the transaction list from Local_Storage and restore all previously saved transactions.
4. IF Local_Storage is unavailable or returns malformed data, THEN THE App SHALL initialize with an empty transaction list and continue operating normally.

---

### Requirement 6: Performance and Responsiveness

**User Story:** As a user, I want the app to respond instantly to my actions, so that my experience is smooth and uninterrupted.

#### Acceptance Criteria

1. WHEN the App is loaded in a modern browser (Chrome, Firefox, Edge, or Safari), THE App SHALL render the full interface within 2 seconds on a standard broadband connection.
2. WHEN a transaction is added or deleted, THE App SHALL update the Balance_Display, Transaction_List, and Pie_Chart within 100 milliseconds.
3. THE App SHALL operate as a standalone web application without requiring a backend server or build process.

---

### Requirement 7: Code and File Structure

**User Story:** As a developer, I want the codebase to follow a clean, minimal file structure, so that the project is easy to read and maintain.

#### Acceptance Criteria

1. THE App SHALL contain exactly one CSS file located in the `css/` directory.
2. THE App SHALL contain exactly one JavaScript file located in the `js/` directory.
3. THE App SHALL be launchable by opening a single `index.html` file directly in a browser.

---

### Requirement 8: Visual Design and Usability

**User Story:** As a user, I want a clean and readable interface, so that I can use the app without confusion or visual clutter.

#### Acceptance Criteria

1. THE App SHALL apply a consistent visual hierarchy with clear typographic distinction between headings, labels, and data values.
2. THE App SHALL use a color scheme that provides sufficient contrast for readability in standard lighting conditions.
3. THE App SHALL render correctly on viewport widths from 320px to 1920px without horizontal scrolling or overlapping elements.
