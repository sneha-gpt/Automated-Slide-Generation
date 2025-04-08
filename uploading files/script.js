document.addEventListener("DOMContentLoaded", function () {
  const fileUpload = document.getElementById("file-upload");
  const fileName = document.getElementById("file-name");
  const processButton = document.getElementById("process-button");
  const backButton = document.querySelector(".back-button");
  const uploadSection = document.querySelector(".upload-section");
  const analysisResults = document.querySelector(".analysis-results");
  const tabButtons = document.querySelectorAll(".tab-button");

  // Initially hide the analysis results
  analysisResults.style.display = "none";

  function updateProgressStep(stepIndex) {
    const steps = document.querySelectorAll(".step");
    steps.forEach((step, index) => {
      if (index <= stepIndex) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    });
  }

  fileUpload.addEventListener("change", function (e) {
    if (e.target.files.length > 0) {
      if (e.target.files.length === 1) {
        fileName.textContent = e.target.files[0].name;
      } else {
        fileName.textContent = `${e.target.files.length} files selected`;
      }
      processButton.disabled = false;
    } else {
      fileName.textContent = "No file chosen";
      processButton.disabled = true;
    }
  });

  processButton.addEventListener("click", async function (e) {
    e.preventDefault(); // Prevent the default form submission behavior

    // Show loading state
    processButton.disabled = true;
    processButton.textContent = "Processing...";

    try {
      const files = fileUpload.files;
      const results = [];

      // Move to Extract step
      updateProgressStep(1);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("http://localhost:5000/process", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to process file");
          }

          results.push({
            filename: file.name,
            text: data.text,
          });
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          results.push({
            filename: file.name,
            error: error.message,
          });
        }
      }

      // Move to Analyze step
      updateProgressStep(2);

      // Hide upload section
      uploadSection.style.display = "none";

      // Show analysis results
      displayResults(results);
      analysisResults.style.display = "block";

      // Move to Review step
      updateProgressStep(3);
    } catch (error) {
      console.error("Error:", error);
      alert(
        "An error occurred while processing the documents. Please try again."
      );
      processButton.disabled = false;
      processButton.textContent = "Process Documents";
    }
  });

  function displayResults(results) {
    const contentBox = document.querySelector(".content-box");
    if (!contentBox) {
      console.error("Content box not found");
      return;
    }

    let html = '<div class="results-container">';

    if (results.length === 0) {
      html += '<div class="error-message">No results to display</div>';
    } else {
      results.forEach((result) => {
        html += `
          <div class="result-item">
            <h3>${result.filename}</h3>
            ${
              result.error
                ? `<p class="error-message">Error: ${result.error}</p>`
                : `<div class="extracted-text">${formatText(result.text)}</div>`
            }
          </div>
        `;
      });
    }

    html += "</div>";
    contentBox.innerHTML = html;
  }

  function formatText(text) {
    if (!text) return "";
    // Convert text to HTML-safe format and preserve line breaks
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }

  // Tab switching functionality
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Back button functionality
  backButton.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    // Reset to the initial state
    analysisResults.style.display = "none";
    uploadSection.style.display = "block";

    // Reset progress bar
    updateProgressStep(0);

    // Reset file input
    fileUpload.value = "";
    fileName.textContent = "No file chosen";

    // Reset process button
    processButton.disabled = true;
    processButton.textContent = "Process Documents";
  });

  // Start Over functionality
  const startOverButton = document.querySelector(".action-button.secondary");
  if (startOverButton) {
    startOverButton.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent default behavior
      // Reset to the initial state
      analysisResults.style.display = "none";
      uploadSection.style.display = "block";

      // Reset progress bar
      updateProgressStep(0);

      // Reset file input
      fileUpload.value = "";
      fileName.textContent = "No file chosen";

      // Reset process button
      processButton.disabled = true;
      processButton.textContent = "Process Documents";
    });
  }
});
