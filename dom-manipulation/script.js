// script.js

// Initial array of quote objects
const quotes = [
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

// Function to show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");

  // Update the DOM using innerHTML
  quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><p><strong>Category:</strong> ${randomQuote.category}</p>`;
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // Display feedback to the user
    alert("Quote added successfully!");

    // Optionally, display the newly added quote immediately
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>"${newQuoteText}"</p><p><strong>Category:</strong> ${newQuoteCategory}</p>`;
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Event listener for the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
