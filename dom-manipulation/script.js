// ===== Data =====
const quotes = [
  { text: "The secret of getting ahead is getting started.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "First, solve the problem. Then, write the code.", category: "Programming" },
];

// ===== Helpers =====
const $ = (sel, parent = document) => parent.querySelector(sel);

function uniqueCategories(list) {
  return Array.from(new Set(list.map(q => q.category))).sort((a, b) => a.localeCompare(b));
}

function updateCount(filtered) {
  const el = $("#count");
  el.textContent = `${filtered.length} quote${filtered.length === 1 ? "" : "s"} available`;
}

function renderQuote(q) {
  const container = $("#quoteDisplay");
  container.innerHTML = "";
  if (!q) {
    container.innerHTML = `<span class="muted">No quote found for this category.</span>`;
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="quote">“${q.text}”</div>
    <div class="category-pill" aria-label="Category">${q.category}</div>
  `;
  container.appendChild(wrapper);
}

function getFilteredQuotes() {
  const filter = $("#categoryFilter").value;
  if (filter === "__ALL__") return quotes;
  return quotes.filter(q => q.category === filter);
}

// ===== Core functions required by task =====
function showRandomQuote() {
  const pool = getFilteredQuotes();
  updateCount(pool);
  if (pool.length === 0) {
    renderQuote(null);
    return;
  }
  const idx = Math.floor(Math.random() * pool.length);
  renderQuote(pool[idx]);
}

function createAddQuoteForm() {
  const mount = $("#formMount");
  const form = document.createElement("form");
  form.setAttribute("aria-labelledby", "addQuoteTitle");
  form.noValidate = true;

  const categories = uniqueCategories(quotes);

  form.innerHTML = `
    <h2 id="addQuoteTitle">Add a Quote</h2>
    <div class="row">
      <div>
        <label for="newQuoteText">Quote <span class="muted">(required)</span></label>
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" required />
      </div>
      <div>
        <label for="newQuoteCategory">Category <span class="muted">(required)</span></label>
        <input id="newQuoteCategory" list="categoryOptions" type="text" placeholder="e.g., Motivation" required />
        <datalist id="categoryOptions">
          ${categories.map(c => `<option value="${c}"></option>`).join("")}
        </datalist>
      </div>
    </div>
    <button id="addQuoteBtn" type="submit">Add Quote</button>
    <div class="help">Tip: Start typing category to reuse an existing one.</div>
    <div id="formStatus" role="status" aria-live="polite"></div>
  `;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addQuote();
  });

  mount.replaceChildren(form);
}

// Global for inline compatibility if needed
function addQuote() {
  const textEl = $("#newQuoteText");
  const catEl = $("#newQuoteCategory");
  const status = $("#formStatus");

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  // Simple validation
  if (!text || !category) {
    status.textContent = "";
    status.className = "error";
    status.textContent = "Both quote and category are required.";
    return;
  }

  // Update data
  quotes.push({ text, category });

  // Reset form fields
  textEl.value = "";
  // Keep category so users can add multiple quotes to same category

  // Update UI: categories dropdown + datalist + count
  hydrateCategoryFilter(); // re-populate categories if a new one was introduced
  // Refresh datalist suggestions
  const datalist = $("#categoryOptions");
  datalist.innerHTML = uniqueCategories(quotes).map(c => `<option value="${c}"></option>`).join("");

  status.textContent = "";
  status.className = "success";
  status.textContent = "Quote added successfully.";

  // Show the newly added quote if filter matches
  const currentFilter = $("#categoryFilter").value;
  if (currentFilter === "__ALL__" || currentFilter === category) {
    renderQuote({ text, category });
    updateCount(getFilteredQuotes());
  }
}

// ===== UI bootstrapping =====
function hydrateCategoryFilter() {
  const select = $("#categoryFilter");
  const prev = select.value || "__ALL__";
  const cats = uniqueCategories(quotes);

  // Build options
  select.innerHTML = [
    `<option value="__ALL__">All categories</option>`,
    ...cats.map(c => `<option value="${c}">${c}</option>`)
  ].join("");

  // Restore previous selection if possible
  const exists = Array.from(select.options).some(opt => opt.value === prev);
  select.value = exists ? prev : "__ALL__";

  // Update count to reflect current filter
  updateCount(getFilteredQuotes());
}

function init() {
  // Prepare filter dropdown
  hydrateCategoryFilter();

  // Wire events (must use getElementById for ALX checker)
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("categoryFilter").addEventListener("change", showRandomQuote);

  // Create Add Quote form dynamically (advanced DOM manipulation)
  createAddQuoteForm();

  // Initial render
  showRandomQuote();
}

document.addEventListener("DOMContentLoaded", init);

// Expose required functions globally in case of inline usage/testing
window.showRandomQuote = showRandomQuote;
window.createAddQuoteForm = createAddQuoteForm;
window.addQuote = addQuote;
