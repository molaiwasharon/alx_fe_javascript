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

// Populate the category filter dropdown with unique categories
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";

  // Extract unique categories
  const categories = [...new Set(quotes.map((quote) => quote.category))];

  // Clear existing options
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Populate with unique categories
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === selectedCategory) {
      option.selected = true;
    }
    categoryFilter.appendChild(option);
  });
}

// Show a random quote based on the selected category
function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  let filteredQuotes = quotes;

  // Filter quotes based on selected category
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter((q) => q.category === selectedCategory);
  }

  // Display message if no quotes are available for the selected category
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML =
      "No quotes available for this category.";
    return;
  }

  // Select a random quote from filtered quotes
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

  // Create button for adding a new quote
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  // Append elements to the DOM
  const formContainer = document.createElement("div");
  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);
  document.body.appendChild(formContainer);
}

// Add a new quote to the quotes array and update local storage
function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  // Check if both fields are filled
  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  // Add the new quote
  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  // Post new quote to the server
  postQuoteToServer(newQuote);

  // Update UI
  showRandomQuote();
  populateCategories();

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Export quotes to a JSON file
function exportToJsonFile() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a download link
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();

  // Revoke the object URL after download
  URL.revokeObjectURL(url);
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    showRandomQuote();
    alert("Quotes imported successfully!");
  };

  fileReader.readAsText(event.target.files[0]);
}

// Filter quotes based on the selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;

  // Save selected category to local storage
  localStorage.setItem("selectedCategory", selectedCategory);

  // Update UI with filtered quotes
  showRandomQuote();
}

// Sync quotes with server periodically
async function syncQuotesWithServer() {
  const serverQuotes = await fetchQuotesFromServer();

  // Resolve conflicts by preferring server data
  const mergedQuotes = resolveConflicts(serverQuotes, quotes);

  // Update local storage with merged data
  quotes = mergedQuotes;
  saveQuotes();

  // Update UI
  populateCategories();
  showRandomQuote();

  // Notify user about the sync
  notifyUser("Quotes synchronized with server.");
}

// Resolve conflicts between server and local quotes
function resolveConflicts(serverQuotes, localQuotes) {
  const localQuotesMap = new Map(localQuotes.map((q) => [q.text, q]));

  serverQuotes.forEach((serverQuote) => {
    if (!localQuotesMap.has(serverQuote.text)) {
      localQuotesMap.set(serverQuote.text, serverQuote);
    } else {
      const localQuote = localQuotesMap.get(serverQuote.text);
      if (localQuote.category !== serverQuote.category) {
        notifyUser(
          `Conflict detected for quote: "${serverQuote.text}". Server data used.`
        );
        localQuotesMap.set(serverQuote.text, serverQuote);
      }
    }
  });

  return Array.from(localQuotesMap.values());
}

// Notify users of updates
function notifyUser(message) {
  const notification = document.createElement("div");
  notification.style.position = "fixed";
  notification.style.bottom = "10px";
  notification.style.right = "10px";
  notification.style.backgroundColor = "#ffcc00";
  notification.style.padding = "10px";
  notification.style.borderRadius = "5px";
  notification.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts"); // Replace with your mock endpoint
    if (response.ok) {
      const serverQuotes = await response.json();
      return serverQuotes.map((item) => ({
        text: item.title,
        category: "General",
      })); // Adjust this to fit your data structure
    }
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
  }
  return [];
}

// Simulate posting a new quote to the server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({
        title: quote.text,
        body: quote.category,
        userId: 1,
      }),
      headers: {
        "Content-Type": "application/json; charset=UTF-8", // Ensure correct content type
      },
    });
    if (response.ok) {
      const newQuote = await response.json();
      console.log("Quote successfully posted:", newQuote);
      return true;
    }
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
  return false;
}

// Initialize application
window.onload = function () {
  // Retrieve last viewed quote from session storage
  const lastViewedQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));

  if (lastViewedQuote) {
    document.getElementById(
      "quoteDisplay"
    ).innerHTML = `"${lastViewedQuote.text}"<br><strong>Category:</strong> ${lastViewedQuote.category}`;
  } else {
    showRandomQuote(); // Show a random quote if no last viewed quote exists
  }

  // Populate the category filter and select the last chosen category
  populateCategories();

  // Create the form for adding quotes
  createAddQuoteForm();
};

// Periodically sync quotes with server every 60 seconds
setInterval(syncQuotesWithServer, 60000);
