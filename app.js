document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const resultsList = document.getElementById("results");
  const articleDiv = document.getElementById("article");
  const backButton = document.getElementById("backButton");
  const articleTitle = document.getElementById("articleTitle");
  const articleContent = document.getElementById("articleContent");
  const languageSelect = document.getElementById("languageSelect");

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
          const images = data.parse.images || [];
          fetchImageUrls(images, (imageUrls) => {
            displayArticle(title, htmlContent, imageUrls);
          });
        } else {
          alert("Article content could not be fetched.");
        }
      })
      .catch((error) => console.error("Error fetching article:", error));
  }

  // Fetch image URLs
  function fetchImageUrls(imageTitles, callback) {
    if (imageTitles.length === 0) {
      callback([]); // No images found
      return;
    }
  
    // Prepare file titles for the query
    const titles = imageTitles.map((title) => `File:${title}`).join("|");
    
    fetch(
      `https://${currentLanguage}.wikipedia.org/w/api.php?action=query&titles=${titles}&prop=imageinfo&iiprop=url&format=json&origin=*`
    )
      .then((response) => response.json())
      .then((data) => {
        const imageUrls = [];
        
        if (data.query && data.query.pages) {
          Object.values(data.query.pages).forEach((page) => {
            if (page.imageinfo && page.imageinfo[0].url) {
              // Extract valid URL from imageinfo
              imageUrls.push(page.imageinfo[0].url);
            } else if (page.title) {
              // Fallback: Construct URL manually using Special:FilePath
              const fallbackUrl = `https://${currentLanguage}.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(
                page.title.replace("File:", "")
              )}`;
              imageUrls.push(fallbackUrl);
            }
          });
        }
        
        callback(imageUrls);
      })
      .catch((error) => console.error("Error fetching image URLs:", error));
  }
  
  
  

  // Display article content and images
  function displayArticle(title, htmlContent, imageUrls) {
    articleTitle.textContent = title;
    articleContent.innerHTML = htmlContent;

    // Display images if any
    if (imageUrls.length > 0) {
      const imageGallery = document.createElement("div");
      imageGallery.className = "image-gallery";
      imageUrls.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = `${title} Image`;
        img.className = "article-image";
        imageGallery.appendChild(img);
      });
      articleContent.appendChild(imageGallery);
    }

    resultsList.innerHTML = ""; // Clear results
    articleDiv.classList.remove("hidden");
  }

  // Back Button Functionality
  backButton.addEventListener("click", () => {
    articleDiv.classList.add("hidden");
    resultsList.innerHTML = ""; // Clear the article view
  });
});
