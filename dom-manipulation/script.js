// ===== Storage Keys =====
const LS_KEY_QUOTES = "quotes";
const LS_KEY_FILTER = "lastCategoryFilter";
const SS_KEY_LAST_QUOTE = "lastQuote";

// ===== Initial Data (fallback) =====
let quotes = [
  { text: "The secret of getting ahead is getting started.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "First, solve the problem. Then, write the code.", category: "Programming" },
];

// ===== Helpers =====
function uniqueCategories(list) {
  return Array.from(new Set(list.map(q => q.category))).sort((a, b) => a.localeCompare(b));
}

function updateCount(filtered) {
  const el = document.getElementById("count");
  el.textContent = `${filtered.length} quote${filtered.length === 1 ? "" : "s"} available`;
}

function renderQuote(q) {
  const container = document.getElementById("quoteDisplay");
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
  const val = document.getElementById("categoryFilter").value;
  if (val === "all") return quotes;
  return quotes.filter(q => q.category === val);
}

// ===== Local Storage Helpers =====
function saveQuotes() {
  try { localStorage.setItem(LS_KEY_QUOTES, JSON.stringify(quotes)); }
  catch (e) { console.error("Failed to save quotes to localStorage", e); }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_KEY_QUOTES);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
    }
  } catch (e) {
    console.warn("Failed to parse quotes from localStorage, using defaults.", e);
  }
}

// ===== Session Storage (optional) =====
function saveLastQuoteToSession(q) {
  try { sessionStorage.setItem(SS_KEY_LAST_QUOTE, JSON.stringify(q)); }
  catch (e) { console.error("Failed to save last quote to sessionStorage", e); }
}

function loadLastQuoteFromSession() {
  try {
    const raw = sessionStorage.getItem(SS_KEY_LAST_QUOTE);
    if (!raw) return null;
    const q = JSON.parse(raw);
    if (q && typeof q.text === "string" && typeof q.category === "string") return q;
  } catch (e) {
    console.warn("Failed to parse last quote from sessionStorage", e);
  }
  return null;
}

// ===== Task-required functions =====
// Populate the category dropdown dynamically from quotes[]
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const current = localStorage.getItem(LS_KEY_FILTER) || select.value || "all";
  const cats = uniqueCategories(quotes);

  // Build options: "all" + unique categories
  const options = [`<option value="all">All Categories</option>`, ...cats.map(c => `<option value="${c}">${c}</option>`)].join("");
  select.innerHTML = options;

  // restore last chosen filter if present
  if (Array.from(select.options).some(o => o.value === current)) {
    select.value = current;
  } else {
    select.value = "all";
  }

  // update count for current filter
  updateCount(getFilteredQuotes());
}

// Filter quotes based on the selected category and remember it
function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  const chosen = select.value;
  // remember the selection across sessions
  try { localStorage.setItem(LS_KEY_FILTER, chosen); } catch {}
  const pool = getFilteredQuotes();
  updateCount(pool);

  // Show a representative quote under the current filter
  if (pool.length === 0) {
    renderQuote(null);
    return;
  }
  const idx = Math.floor(Math.random() * pool.length);
  const q = pool[idx];
  renderQuote(q);
  saveLastQuoteToSession(q);
}

// Show a random quote honoring the currently selected filter
function showRandomQuote() {
  const pool = getFilteredQuotes();
  updateCount(pool);
  if (pool.length === 0) { renderQuote(null); return; }
  const idx = Math.floor(Math.random() * pool.length);
  const q = pool[idx];
  renderQuote(q);
  saveLastQuoteToSession(q);
}

// Dynamically create the "Add Quote" form (advanced DOM manipulation)
function createAddQuoteForm() {
  const mount = document.getElementById("formMount");
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
    <div id="formStatus" role="status" aria-live="polite"></div>
  `;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    addQuote();
  });

  mount.replaceChildren(form);
}

// Add quote + update categories in real-time + persist
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");
  const status = document.getElementById("formStatus");

  const text = textEl.value.trim();
  const category = catEl.value.trim();

  status.textContent = "";
  status.className = "";
  if (!text || !category) {
    status.className = "error";
    status.textContent = "Both quote and category are required.";
    return;
  }

  quotes.push({ text, category });
  saveQuotes(); // persist to localStorage

  // reset text field, keep category for fast multiple adds
  textEl.value = "";

  // Update categories dropdown + datalist in real-time
  populateCategories(); // ensures new category appears if introduced
  const datalist = document.getElementById("categoryOptions");
  datalist.innerHTML = uniqueCategories(quotes).map(c => `<option value="${c}"></option>`).join("");

  status.className = "success";
  status.textContent = "Quote added successfully.";

  // If current filter matches, show the new quote; else keep current filtered view
  const currentFilter = document.getElementById("categoryFilter").value;
  if (currentFilter === "all" || currentFilter === category) {
    renderQuote({ text, category });
    updateCount(getFilteredQuotes());
    saveLastQuoteToSession({ text, category });
  }
}

// ===== Init =====
function init() {
  // Load quotes and last filter from storage
  loadQuotes();

  // Build categories from quotes[]
  populateCategories();

  // Attach listeners (ALX checker: explicit getElementById usage)
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

  // JSON controls
  document.getElementById("exportJson").addEventListener("click", exportToJson);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  // Create form dynamically
  createAddQuoteForm();

  // First render: if session has a last quote matching current filter, show it; else filter/choose random
  const last = loadLastQuoteFromSession();
  const currentFilter = document.getElementById("categoryFilter").value;
  if (last && (currentFilter === "all" || last.category === currentFilter)) {
    renderQuote(last);
  } else {
    filterQuotes(); // ensures UI matches current filter and persists selection
  }
}

document.addEventListener("DOMContentLoaded", init);

// ===== JSON Export/Import (kept from previous task) =====
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert("Invalid file format: expected an array of quotes.");
        return;
      }
      const cleaned = imported
        .filter(x => x && typeof x.text === "string" && typeof x.category === "string")
        .map(x => ({ text: x.text, category: x.category }));
      quotes.push(...cleaned);
      saveQuotes();
      populateCategories();      // reflect new categories from import
      updateCount(getFilteredQuotes());
      alert("Quotes imported successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to import JSON. Please check the file structure.");
    } finally {
      event.target.value = "";
    }
  };
  fileReader.readAsText(file);
}

// Expose for checkers/manual testing
window.populateCategories = populateCategories;
window.filterQuotes = filterQuotes;
window.showRandomQuote = showRandomQuote;
window.createAddQuoteForm = createAddQuoteForm;
window.addQuote = addQuote;
window.importFromJsonFile = importFromJsonFile;
