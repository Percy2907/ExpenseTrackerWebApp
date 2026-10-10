const test = require("node:test");
const assert = require("node:assert/strict");
const ExpenseStore = require("../src/expenseStore");
const { validateExpense } = require("../src/app");

test("adds an expense and gives it an ID", () => {
  const store = new ExpenseStore();
  const expense = store.add("Notebook", "School", 8.5);

  assert.equal(expense.id, 1);
  assert.equal(store.getAll().length, 1);
});

test("filters expenses and calculates the displayed total", () => {
  const store = new ExpenseStore();
  store.add("Groceries", "Food", 25);
  store.add("Lunch", "Food", 12);
  store.add("Bus", "Transportation", 5);

  const foodExpenses = store.filterByCategory("Food");
  assert.equal(foodExpenses.length, 2);
  assert.equal(store.calculateTotal(foodExpenses), 37);
});

test("deletes an existing expense", () => {
  const store = new ExpenseStore();
  const expense = store.add("Internet", "Utilities", 40);

  assert.equal(store.deleteById(expense.id), true);
  assert.equal(store.getAll().length, 0);
});

test("reports invalid expense form values", () => {
  const result = validateExpense("", "", "text");
  assert.equal(result.errors.length, 3);
});
