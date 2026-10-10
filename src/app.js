const path = require("path");
const express = require("express");
const ExpenseStore = require("./expenseStore");

const app = express();
const port = process.env.PORT || 3000;

const store = new ExpenseStore([
  { id: 1, description: "Groceries", category: "Food", amount: 45.5 },
  { id: 2, description: "Bus card", category: "Transportation", amount: 20 },
]);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "public")));

/** Changes a number into a simple dollar value for the pages. */
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

/** Validates the values submitted by the add-expense form. */
function validateExpense(description, category, amountText) {
  const errors = [];
  const amount = Number(amountText);

  if (!description.trim()) {
    errors.push("Description is required.");
  }

  if (!category.trim()) {
    errors.push("Category is required.");
  }

  if (!amountText.trim() || !Number.isFinite(amount) || amount <= 0) {
    errors.push("Amount must be a number greater than zero.");
  }

  return { errors, amount };
}

/** Displays the home page with totals calculated from the current expenses. */
function showHome(request, response) {
  const expenses = store.getAll();

  response.render("home", {
    pageTitle: "Expense Tracker",
    currentPage: "home",
    expenseCount: expenses.length,
    totalAmount: store.calculateTotal(expenses),
    categoryTotals: store.calculateTotalsByCategory(),
    formatCurrency,
  });
}

/** Displays the expense list and applies an optional category filter. */
function showExpenses(request, response) {
  const selectedCategory = String(request.query.category || "");
  const expenses = store.filterByCategory(selectedCategory);

  response.render("expenses", {
    pageTitle: "Expense List",
    currentPage: "expenses",
    expenses,
    categories: store.getCategories(),
    selectedCategory,
    filteredTotal: store.calculateTotal(expenses),
    message: String(request.query.message || ""),
    formatCurrency,
  });
}

/** Displays the form used to create a new expense. */
function showAddExpense(request, response) {
  response.render("add-expense", {
    pageTitle: "Add Expense",
    currentPage: "add",
    errors: [],
    formData: { description: "", category: "", amount: "" },
  });
}

/** Processes the form, reports validation errors, or adds a valid expense. */
function addExpense(request, response) {
  const description = String(request.body.description || "").trim();
  const category = String(request.body.category || "").trim();
  const amountText = String(request.body.amount || "").trim();
  const { errors, amount } = validateExpense(description, category, amountText);

  if (errors.length > 0) {
    response.status(400).render("add-expense", {
      pageTitle: "Add Expense",
      currentPage: "add",
      errors,
      formData: { description, category, amount: amountText },
    });
    return;
  }

  store.add(description, category, amount);
  response.redirect("/expenses?message=Expense%20added%20successfully.");
}

/** Deletes the selected expense and returns to the expense list. */
function deleteExpense(request, response) {
  const expenseId = Number.parseInt(request.params.id, 10);

  if (!Number.isInteger(expenseId)) {
    response.redirect("/expenses?message=Invalid%20expense%20ID.");
    return;
  }

  const wasDeleted = store.deleteById(expenseId);
  const message = wasDeleted
    ? "Expense deleted successfully."
    : "Expense was not found.";

  response.redirect(`/expenses?message=${encodeURIComponent(message)}`);
}

/** Displays a simple page when a route does not exist. */
function showNotFound(request, response) {
  response.status(404).render("not-found", {
    pageTitle: "Page Not Found",
    currentPage: "",
  });
}

app.get("/", showHome);
app.get("/expenses", showExpenses);
app.get("/expenses/new", showAddExpense);
app.post("/expenses", addExpense);
app.post("/expenses/:id/delete", deleteExpense);
app.use(showNotFound);

/** Starts the local test server when this file is run directly. */
function startServer() {
  app.listen(port, () => {
    console.log(`Expense Tracker is running at http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, formatCurrency, validateExpense };
