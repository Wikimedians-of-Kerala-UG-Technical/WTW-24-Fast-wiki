document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const resultsList = document.getElementById("results");
  const articleDiv = document.getElementById("article");
  const backButton = document.getElementById("backButton");
  const articleTitle = document.getElementById("articleTitle");
  const articleContent = document.getElementById("articleContent");
  const languageSelect = document.getElementById("languageSelect");
  const suggestionList = document.getElementById("suggestionList");

  let currentLanguage = "en";

  // Change language dynamically
  languageSelect.addEventListener("change", () => {
    currentLanguage = languageSelect.value;
  });

  // Handle Search Button Click
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      fetchSearchResults(query);
    } else {
      alert("Please enter a search term.");
    }
  });

  // Real-time Suggestions
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    if (query) {
      fetchSuggestions(query);
    } else {
      suggestionList.classList.add("d-none");
    }
  });

  // Fetch Suggestions
  function fetchSuggestions(query) {
    fetch(
      `https://${currentLanguage}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        query
      )}&limit=10&namespace=0&format=json&origin=*`
    )
      .then((response) => response.json())
      .then((data) => {
        displaySuggestions(data[1]);
      })
      .catch((error) => console.error("Error fetching suggestions:", error));
  }

  // Display Suggestions
  function displaySuggestions(suggestions) {
    suggestionList.innerHTML = ""; // Clear previous suggestions

    if (suggestions.length > 0) {
      suggestions.forEach((suggestion) => {
        const li = document.createElement("li");
        li.textContent = suggestion;
        li.className = "list-group-item list-group-item-action";
        li.addEventListener("click", () => {
          searchInput.value = suggestion; // Fill input with clicked suggestion
          suggestionList.classList.add("d-none"); // Hide suggestions
          fetchSearchResults(suggestion); // Trigger search
        });
        suggestionList.appendChild(li);
      });

      suggestionList.classList.remove("d-none"); // Show suggestions
    } else {
      suggestionList.classList.add("d-none"); // Hide if no suggestions
    }
  }

  // Fetch search results
  function fetchSearchResults(query) {
    resultsList.innerHTML = ""; // Clear previous results
    articleDiv.classList.add("hidden");

    fetch(
      `https://${currentLanguage}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.query && data.query.search.length > 0) {
          displayResults(data.query.search);
        } else {
          resultsList.innerHTML = "<p>No results found. Try a different query.</p>";
        }
      })
      .catch((error) => console.error("Error fetching search results:", error));
  }

  // Display search results
  function displayResults(results) {
    resultsList.innerHTML = ""; // Clear previous results
    results.forEach((result) => {
      const li = document.createElement("li");
      li.textContent = result.title;
      li.dataset.pageId = result.pageid;
      li.tabIndex = 0; // Make it focusable for accessibility
      li.setAttribute("role", "button");
      li.addEventListener("click", () => fetchArticle(result.pageid, result.title));
      resultsList.appendChild(li);
    });
  }

  // Fetch article details
  function fetchArticle(pageId, title) {
    fetch(
      `https://${currentLanguage}.wikipedia.org/w/api.php?action=parse&pageid=${pageId}&prop=text&format=json&origin=*`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.parse && data.parse.text) {
          const htmlContent = data.parse.text["*"];
          displayArticle(title, htmlContent);
        } else {
          alert("Article content could not be fetched.");
        }
      })
      .catch((error) => console.error("Error fetching article:", error));
  }

  // Display article content
  function displayArticle(title, htmlContent) {
    articleTitle.textContent = title;
    articleContent.innerHTML = htmlContent;

    resultsList.innerHTML = ""; // Clear results
    articleDiv.classList.remove("hidden");
  }

  // Back Button Functionality
  backButton.addEventListener("click", () => {
    articleDiv.classList.add("hidden");
    resultsList.innerHTML = ""; // Clear the article view
  });
});
