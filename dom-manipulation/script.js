// script.js

// Load quotes from local storage or use default quotes
const defaultQuotes = [
  {
    text: "The only limit to our realization of tomorrow is our doubts of today.",
    category: "Motivation",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" },
  { text: "Get busy living or get busy dying.", category: "Motivation" },
];

// Load quotes from local storage or set default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || defaultQuotes;

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Get unique categories from quotes
function getCategories() {
  const categories = quotes.map((q) => q.category);
  return [...new Set(categories)];
}

// Populate category dropdown
function populateCategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  getCategories().forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === selectedCategory) {
      option.selected = true;
    }
    categoryFilter.appendChild(option);
  });
}

// Show a random quote
function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter((q) => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML =
      "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");

  // Clear existing content
  quoteDisplay.innerHTML = "";

  // Create elements for quote text and category
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${randomQuote.text}"`;

  const quoteCategory = document.createElement("p");
  quoteCategory.innerHTML = `<strong>Category:</strong> ${randomQuote.category}`;

  // Append elements to the quote display
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);

  // Save last viewed quote to session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// Create the form for adding quotes
function createAddQuoteForm() {
  // Create input elements for quote text and category
  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  // Create the add quote button
  const addButton = document.createElement("button");
  addButton.id = "addQuoteButton";
  addButton.textContent = "Add Quote";

  // Append input fields and button to the form container
  const formContainer = document.getElementById("addQuoteForm");
  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  // Add event listener for the "Add Quote" button
  addButton.addEventListener("click", addQuote);
}

// Add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });

    // Save updated quotes to local storage
    saveQuotes();

    // Update categories
    populateCategoryFilter();

    // Clear input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // Feedback to the user and update the DOM with the new quote
    alert("Quote added successfully!");
    showRandomQuote(); // Display a new random quote after adding
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Export quotes to JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();

  // Release URL after downloading
  URL.revokeObjectURL(url);
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);

      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
        showRandomQuote();
        populateCategoryFilter(); // Update categories after import
      } else {
        throw new Error("Invalid format");
      }
    } catch (error) {
      alert("Failed to import quotes: " + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// Event listener for the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Event listener for the "Export Quotes to JSON" button
document
  .getElementById("exportJson")
  .addEventListener("click", exportToJsonFile);

// Initialize the application
window.onload = function () {
  // Display the last viewed quote from session storage, if available
  const lastViewedQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastViewedQuote) {
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>"${lastViewedQuote.text}"</p><p><strong>Category:</strong> ${lastViewedQuote.category}</p>`;
  } else {
    showRandomQuote(); // Show a random quote if no last viewed quote exists
  }

  // Populate the category filter and select the last chosen category
  populateCategoryFilter();

  // Create the form for adding quotes
  createAddQuoteForm();
};
