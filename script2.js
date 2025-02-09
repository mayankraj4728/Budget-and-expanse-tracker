let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

const apiKey = "6a19f0f69bf54bd7b5f6bd327a3f77b9";

const expenseList = document.getElementById("expense-list");
const totalAmountElement = document.getElementById("total-amount");
const addExpenseButton = document.getElementById("add-expense");

async function getExchangeRates() {
  try {
    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`
    );
    const data = await response.json();
    console.log("Exchange rates:", data.rates);
    return data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
}

async function addExpense() {
  console.log("addExpense function called");

  const name = document.getElementById("expense-name").value.trim();
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const currency = document.getElementById("currency").value;
  const category = document.getElementById("category").value;

  if (!name || isNaN(amount)) {
    alert("Please enter a valid expense name and amount!");
    return;
  }

  const rates = await getExchangeRates();
  if (!rates) {
    alert("Error fetching exchange rates. Try again later.");
    return;
  }

  const convertedAmount = amount / rates[currency];

  const expense = { name, amount, currency, category, convertedAmount };
  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  console.log("Updated expenses:", expenses);
  renderExpenses();

  document.getElementById("expense-name").value = "";
  document.getElementById("expense-amount").value = "";
}

function renderExpenses() {
  expenseList.innerHTML = "";

  expenses.forEach((expense, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <strong>${expense.name}</strong> - ${expense.amount} ${
      expense.currency
    } (${expense.category})
            (~${expense.convertedAmount.toFixed(2)} USD)
            <button onclick="deleteExpense(${index})">❌</button>
        `;
    expenseList.appendChild(li);
  });
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderExpenses();
}

async function calculateTotal() {
  const rates = await getExchangeRates();
  if (!rates || !rates["INR"]) {
    alert("Error fetching exchange rates. Try again later.");
    return;
  }

  let totalUSD = expenses.reduce(
    (sum, expense) => sum + expense.convertedAmount,
    0
  );

  let totalINR = totalUSD * rates["INR"];
  totalAmountElement.textContent = `Total: ₹${totalINR.toFixed(2)} INR`;
}

async function convertCurrency() {
  const amount = parseFloat(document.getElementById("convert-amount").value);
  const fromCurrency = document.getElementById("from-currency").value;
  const toCurrency = document.getElementById("to-currency").value;
  const resultElement = document.getElementById("conversion-result");

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  const rates = await getExchangeRates();
  if (!rates) {
    alert("Error fetching exchange rates. Try again later.");
    return;
  }

  const convertedAmount = (amount / rates[fromCurrency]) * rates[toCurrency];
  resultElement.textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(
    2
  )} ${toCurrency}`;
}

addExpenseButton.addEventListener("click", addExpense);
totalButton.addEventListener("click", calculateTotal);

renderExpenses();
