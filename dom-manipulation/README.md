# Dynamic Quote Generator (Task 0)
ALX Project: DOM Manipulation, Web Storage, and JSON — **Task 0: Building a Dynamic Content Generator**

## What this does
- Advanced DOM manipulation:
  - Creates the **Add Quote** form dynamically via JavaScript (`createAddQuoteForm`).
  - Updates the DOM when quotes are added.
- Event-driven interactions:
  - `Show New Quote` button (`showRandomQuote`).
  - Category filter dropdown updates quotes displayed.
- No frameworks, pure HTML/CSS/JS.

## Files
- `index.html` – Base markup with placeholders.
- `script.js` – All logic (DOM creation, filtering, rendering).
- `README.md` – You are here.

## How to run
Just open `index.html` in a browser.

## Functions required by task
- `showRandomQuote()` – Displays a random quote, honoring the selected category.
- `createAddQuoteForm()` – Dynamically builds the **Add Quote** form and mounts it on the page.
- `addQuote()` – Validates input and appends a new quote to the in-memory array; updates UI accordingly.

## Notes
- Category dropdown includes **All categories** by default.
- The quote form uses a `<datalist>` so you can reuse existing categories quickly.
