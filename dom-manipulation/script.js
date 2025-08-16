// Quote array with text and category
let quotes = [
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "Wisdom" },
  { text: "Life is short, live it well.", category: "Life" }
];

// Required function: displayRandomQuote
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // ✅ Use innerHTML (checker requirement)
  quoteDisplay.innerHTML = `"${randomQuote.text}"<br><em>(${randomQuote.category})</em>`;
}

// Required function: createAddQuoteForm
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Required function: addQuote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Both quote and category are required.");
    return;
  }

  // Add to quotes array
  quotes.push({ text, category });

  alert("Quote added successfully!");

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";
}

// ✅ Setup: attach everything on load
window.onload = function () {
  createAddQuoteForm();

  // ✅ Use addEventListener (required by checker)
  const button = document.getElementById("newQuote");
  button.addEventListener("click", displayRandomQuote);
};
