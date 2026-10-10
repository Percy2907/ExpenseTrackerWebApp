/** Stores the expense list while the program is running. */
class ExpenseStore {
  /** Creates the list and finds the next available ID. */
  constructor(initialExpenses = []) {
    this.expenses = [];
    this.nextId = 1;

    for (const expense of initialExpenses) {
      this.expenses.push({ ...expense });

      if (expense.id >= this.nextId) {
        this.nextId = expense.id + 1;
      }
    }
  }

  /** Returns a copy of the complete expense list. */
  getAll() {
    const expenseCopies = [];

    for (const expense of this.expenses) {
      expenseCopies.push({ ...expense });
    }

    return expenseCopies;
  }

  /** Adds one expense and returns a copy of it. */
  add(description, category, amount) {
    const expense = {
      id: this.nextId,
      description: description,
      category: category,
      amount: amount,
    };

    this.expenses.push(expense);
    this.nextId += 1;
    return { ...expense };
  }

  /** Deletes the expense that has the selected ID. */
  deleteById(id) {
    for (let index = 0; index < this.expenses.length; index += 1) {
      if (this.expenses[index].id === id) {
        this.expenses.splice(index, 1);
        return true;
      }
    }

    return false;
  }

  /** Returns only expenses from one category. */
  filterByCategory(category) {
    if (category === "") {
      return this.getAll();
    }

    const filteredExpenses = [];

    for (const expense of this.expenses) {
      if (expense.category === category) {
        filteredExpenses.push({ ...expense });
      }
    }

    return filteredExpenses;
  }

  /** Creates a list of categories without duplicates. */
  getCategories() {
    const categories = [];

    for (const expense of this.expenses) {
      if (!categories.includes(expense.category)) {
        categories.push(expense.category);
      }
    }

    categories.sort();
    return categories;
  }

  /** Adds the amounts from an expense list. */
  calculateTotal(expenses = this.expenses) {
    let total = 0;

    for (const expense of expenses) {
      total += expense.amount;
    }

    return total;
  }

  /** Calculates one total for each category. */
  calculateTotalsByCategory() {
    const totals = {};

    for (const expense of this.expenses) {
      if (totals[expense.category] === undefined) {
        totals[expense.category] = 0;
      }

      totals[expense.category] += expense.amount;
    }

    return totals;
  }
}

module.exports = ExpenseStore;
